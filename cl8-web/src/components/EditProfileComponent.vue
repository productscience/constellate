<template>
  <div class="cf bg-white">
    <nav class="dt w-100 border-box pa3 ph5-ns bb b--black-10 bg-white" v-if="authenticated" >

      <div class="dtc v-mid w-75 tr">
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" title="my profile">my profile</a>
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" @click="logout()" title="log out">log out</a>
      </div>
    </nav>
    <div v-if="authenticated" class="fl w-two-thirds pa2">
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

                <div class="ma">
                    <input class="ma2" type="radio" id="yes" value="yes" v-model="profile.fields.visible">
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

              <div class="fl w-50 mt0 pt0">
                <ul class="list mt0 pt0">
                  <li class="list f3 name mt2">
                    <label class="f4" for="">name: </label>
                    <input class="w-100 pa2"  v-model="profile.fields.name" />
                  </li>
                  <li class="list f3 email mt2">
                    {{ profile.fields.email }}
                  </li>
                  <li class="list f3 phone mt2">
                    <label class="f4" for="">phone: </label>
                    <input class="w-100 pa2"  v-model="profile.fields.phone" />
                  </li>
                  <li class="list f3 website mt2">
                    <label class="f4" for="">website</label>
                    <input class="w-100 pa2"  v-model="profile.fields.website" />
                  </li>
                </ul>

                <ul class="list mt0 pt0">
                  <li class="list f3 twitter">
                    <label class="f4" for="">twitter: </label>
                    <input class="w-100 pa2"  v-model="profile.fields.twitter" />
                  </li>
                  <li class="list f3 facebook mt2">
                    <label class="f4 " for="">facebook: </label>
                    <input class="w-100 pa2" v-model="profile.fields.facebook" />
                  </li>
                  <li class="list f3 linkedin mt2">
                    <label class="f4" for="">linkedin: </label>
                    <input class="w-100 pa2"  v-model="profile.fields.linkedin" />
                  </li>
                </ul>

              </div>

            </div>

            <div class="cf pt2">
              <label class="typo__label">Skills and interests</label>
              <multiselect v-model="profile.fields.tags"
                class="pt3 pb3"
                tag-placeholder="Add this as new tag"
                placeholder="Search or add a tag"
                label="name" track-by="id"
                :options="profileTags"
                :multiple="true" :taggable="true"
                @tag="addTag"></multiselect>
            </div>

            <hr>

            <a href="#"
              v-on:submit.prevent="onSubmit" @click="onSubmit"
              class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green">
              Save these changes
            </a>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import { includes } from 'lodash'

export default {
  name: 'EditProfileComponent',
  props: ['auth', 'authenticated', 'tags', 'profile', 'fbase'],
  firebase: function () {
    return {
      fbpeeps: this.fbase.db().ref('userlist')
    }
  },
  data () {
    return {
      items: [], // this needs to be the list from firebase
      tagList: [],
      unsyncedTags: [],
      user: JSON.parse(localStorage.getItem('user'))
    }
  },
  components: {
    Multiselect
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
    myProfile: function () {
      let vm = this
      let newProfile = this.items.filter(function (peep) {
        return peep.id === vm.user['https://cl8.io/firebaseId']
      })
      if (newProfile.length > 0) {
        this.$emit('profileChosen', newProfile[0])
      }
    },
    onSubmit: function (item) {
      let newProfile = JSON.parse(JSON.stringify(this.profile))
      delete newProfile['.key']
      this.$firebaseRefs.fbpeeps.child(this.profile['.key']).set(newProfile)

      this.$emit('profileUpdate', this.profile)
      this.$emit('profileChosen', this.profile)
      this.$router.push('/home')
    },
    showProfile: function (someThing, childInstance) {
      let newProfile = this.items.filter(function (peep) {
        return peep.id === childInstance.item.id
      })
      this.profile = newProfile[0]
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
  watch: {},
  computed: {
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
  created () {
    this.fbase.authToFireBase(this.user)
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
