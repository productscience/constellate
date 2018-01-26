<template>
  <div class="cf bg-white">
    <nav-header></nav-header>
    <div class="fl w-two-thirds pa2">
      <div class="pa3 center w-80 cf">
        <div>
          <form class="">
            <div class="cf" style="min-height:11em;">
              <div class="fl w-20 ">
                <img v-if="hasPhoto()"
                  :src="profile.fields.photo[0].thumbnails.large.url"
                  class="supplied-photo b--light-silver ba" />

                <v-gravatar v-else
                  :email="profile.fields.email"
                  :size="200"
                  class="gravatar b--light-silver ba" />

                <div class="ma2">
                    <input tabindex="1" class="ma2" type="radio" id="yes" value="yes" v-model="profile.fields.visible">
                    <label for="yes">Visible</label>
                    <br>
                    <input class="ma2" type="radio" id="no" value="no" v-model="profile.fields.visible">
                    <label for="no">Invisible</label>

                    <div v-if="this.profile.fields.visible == 'yes'"
                    class="f6 link dim br-pill ph3 pv2 mb2 dib white bg-green ma2 w-80" >
                        Visible
                    </div>
                    <div v-else class="f6 link dim br-pill ph3 pv2 mb2 dib white bg-red w-80 ma2">
                      Invisible
                    </div>
                </div>
              </div>

              <div class="fl w-75 mt0 pt0">
                <ul class="list mt0 pt0 f4">
                  <li class="list name">
                    <label class="f5" for="">name</label>
                    <input class="w-100 mt1 pa1"  v-model="profile.fields.name" />
                  </li>

                  <li class="list email mt2">
                    <label class="f5" for="">email</label>
                    <input class="w-100 mt1 pa1 bg-light-gray light-silver" :value="profile.fields.email" readonly />
                  </li>
                  <li class="list phone mt2">
                    <label class="f5 mb2" for="">phone </label>
                    <input class="w-100 mt1 pa1"  v-model="profile.fields.phone" />
                  </li>
                  <li class="list website mt2">
                    <label class="f5" for="">website <small>(http:// is added automatically)</small></label>
                    <input class="w-100 mt1 pa1" v-model="profile.fields.website" />
                  </li>
                </ul>

                <ul class="list mt0 pt0">
                  <li class="list twitter">
                    <label class="f5" for="">twitter <small>(just add your @username)</small></label>
                    <input class="w-100 mt1 pa1"  v-model="profile.fields.twitter" />
                  </li>
                  <li class="list facebook mt2">
                    <label class="f5" for="">facebook <small>(ditto for facebook)</small></label>
                    <input class="w-100 mt1 pa1" v-model="profile.fields.facebook" />
                  </li>
                  <li class="list linkedin mt2">
                    <label class="f5" for="">linkedin <small>(just the bit after http://www.linked.com/in/)</small></label>
                    <input class="w-100 mt1 pa1"  v-model="profile.fields.linkedin" />
                  </li>

                  <li class="list mt2">
                    <label class="f5" for="">Summary <small>(Using <a href="https://daringfireball.net/projects/markdown/">markdown</a> for formatting is supported)</small></label>
                    <textarea 
                      class="w-100 mt1 pa1 ba b--light-gray"
                      v-model="profile.fields.blurb"
                      placeholder="Add a short summary here - 2 paragraphs is plenty"
                      name="" id="" cols="30" rows="10"></textarea>
                    

                  </li>


                </ul>

              </div>

            </div>

            <div class="cf pt2 bg-near-white pa3">
              <label class="typo__label">Skills and interests </label>
              <p class="f6 mb0"><em>(type below to add new tags)</em></p>
              <multiselect v-model="profile.fields.tags"
                class="pt3 pb3"
                tag-placeholder="Add this as new tag"
                placeholder="Search or add a tag"
                label="name" track-by="id"
                :options="profileTags"
                :multiple="true" :taggable="true"
                @tag="addTag"></multiselect>
            </div>

            <p class="f6">
              <em>
                Email gavin@dgen.net to remove your account
              </em>
            </p>

            <hr>

            <a href="#"
              v-on:submit.prevent="onSubmit" @click="onSubmit"
              class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green">
              Save
            </a>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Multiselect from 'vue-multiselect'
import { includes } from 'lodash'
import debugLib from 'debug'
import fbase from '@/fbase'

const debug = debugLib('cl8.EditProfileComponent')

export default {
  name: 'EditProfileComponent',
  components: {
    Multiselect
  },
  firebase: function () {
    return {
      fbpeeps: {
        source: fbase.database().ref('userlist'),
        readyCallback: function () {
          debug('data retrieved from fbase')
        }
      }
    }
  },
  data () {
    return {
      items: [], // this needs to be the list from firebase
      tagList: [],
      unsyncedTags: [],
    }
  },
  computed: {
    profile () {
      return this.$store.getters.profile
    },
    profileTags: function () {
      let tagList = []

      if (this.items.length > 0) {
        this.items.forEach(function (peep) {
          if (typeof peep.fields !== 'undefined') {
            if (typeof peep.fields.tags !== 'undefined') {
              peep.fields.tags.forEach(function (t) {
                let tagListNames = tagList.map(function (tt) {
                  return tt.name
                })
                if (!includes(tagListNames, t.name)) {
                  tagList.push(t)
                }
              })
            }
          }
        })
      }
      if (this.unsyncedTags.length > 0) {
        this.unsyncedTags.forEach(function (t) {
          tagList.push(t)
        })
      }
      return tagList
    }
  },
  methods: {
    addTag (newTag) {
      let tempVal = newTag.substring(0, 2) + Math.floor(
        (Math.random() * 10000000)
      )
      const tag = {
        name: newTag,
        code: tempVal,
        id: 'tempval' + tempVal
      }
      this.profile.fields.tags.push(tag)
      this.unsyncedTags.push(tag)
    },
    onSubmit: function (item) {
      debug('updating profile', this.profile)
      this.$store.dispatch('updateProfile', this.profile)
    },
    hasPhoto () {
      if (typeof this.profile.fields === 'undefined') {
        return false
      }
      if (typeof this.profile.fields.photo === 'undefined') {
        return false
      }
      if (this.profile.fields.photo.length > 0) {
        return true
      }
      // otherwise jjust return false
      return false
    }
  },
  created () {
    this.$bindAsArray('items', this.$firebaseRefs.fbpeeps)
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style media="screen">
p span.list{
  display: inline-block;
}

</style>
