<template>
  <div class="cf bg-white">
    <nav-header-edit/>
    <div class="fl pa2">
      <div class="pa3 center w-80-l cf">
        <div>
          <form class v-if="profile">
            <div class="cf w-100" style="min-height:11em;">
              <div class="fl w-100 w-25-ns mb3">
                <router-link :to="{ name: 'editProfilePhoto' }" class="edithover w-80 mr4">
                  <img
                    v-if="hasPhoto()"
                    :src="showPhoto('large')"
                    class="supplied-photo b--light-silver ba w-100 v-top fn-ns"
                  >

                  <v-gravatar
                    v-else
                    :email="profile.fields.email"
                    :size="200"
                    class="gravatar b--light-silver ba"
                  />
                </router-link>

                <div class="w-40 w-100-ns fn-ns dib v-btm mt2">
                  <div
                    class="f6 dim br2 dib w-80 white mb2"
                    v-bind:class="{ 'bg-green': profile.fields.visible, 'bg-red': !profile.fields.visible }"
                  >
                    <input
                      type="checkbox"
                      class="dib w-20 mv2 ml2"
                      id="visible-checkbox"
                      v-model="profile.fields.visible"
                    >
                    <label for="visible-checkbox" class="dib w-75">Visible</label>
                  </div>

                  <div
                    class="f6 dim br2 dib w-80 white"
                    v-bind:class="{ 'bg-green': profile.fields.pitchable, 'bg-red': !profile.fields.pitchable }"
                  >
                    <input
                      type="checkbox"
                      class="dib w-20 mv2 ml2"
                      id="checkbox"
                      v-model="profile.fields.pitchable"
                    >
                    <label for="checkbox" class="dib w-75">Pitchable</label>
                  </div>

                  <p class="f7 ma2 ml3 w-80">
                    <a
                      href="http://www.dgen.net/0/dgen-constellation-member-overview/"
                    >What does "pitchable" mean?</a>
                  </p>
                </div>
              </div>

              <div class="fl w-100 w-75-ns mt0 pt0">
                <ul class="list mt0 pt0 f4 pa0 border-box">
                  <li class="list name">
                    <label class="f5" for>name</label>
                    <input class="w-100 mt1 pa1" v-model="profile.fields.name">
                  </li>

                  <li class="list email mt2">
                    <label class="f5" for>email</label>
                    <input
                      class="w-100 mt1 pa1 bg-light-gray light-silver"
                      :value="profile.fields.email"
                      readonly
                    >
                  </li>
                  <li class="list phone mt2">
                    <label class="f5 mb2" for>phone</label>
                    <input class="w-100 mt1 pa1" v-model="profile.fields.phone">
                  </li>
                  <li class="list website mt2">
                    <label class="f5" for>
                      website
                      <small>(http:// is added automatically)</small>
                    </label>
                    <input class="w-100 mt1 pa1" v-model="profile.fields.website">
                  </li>
                </ul>

                <ul class="list mt0 pt0 pa0">
                  <li class="list twitter">
                    <label class="f5" for>
                      twitter
                      <small>(just add your @username)</small>
                    </label>
                    <input class="w-100 mt1" v-model="profile.fields.twitter">
                  </li>
                  <li class="list facebook mt2">
                    <label class="f5" for>
                      facebook
                      <small>(ditto for facebook)</small>
                    </label>
                    <input class="w-100 mt1" v-model="profile.fields.facebook">
                  </li>
                  <li class="list linkedin mt2">
                    <label class="f5" for>
                      linkedin
                      <small>(just the bit after http://www.linked.com/in/)</small>
                    </label>
                    <input class="w-100 mt1" v-model="profile.fields.linkedin">
                  </li>

                  <li class="list mt2">
                    <label class="f5" for>
                      Summary
                      <small>
                        (Using
                        <a href="https://daringfireball.net/projects/markdown/">markdown</a> for formatting is supported)
                      </small>
                    </label>
                    <textarea
                      class="w-100 mt1 pa1 ba b--light-gray"
                      v-model="profile.fields.blurb"
                      placeholder="Add a short summary here - 2 paragraphs is plenty"
                      name
                      id
                      cols="30"
                      rows="10"
                    ></textarea>
                  </li>
                </ul>
              </div>

              <div class="cf pt2 bg-white mb4 mb5">
                <label class="typo__label">Skills and interests</label>
                <p class="f6 mb3">
                  <em>(type below to add new tags)</em>
                </p>
                <profile-tags-component
                  :data.sync="profile.fields.tags"
                  :options="profileTags"
                  @newtag="addTag"
                ></profile-tags-component>
              </div>
            </div>

            <p class="f6 tc gray">
              <em>Email gavin@dgen.net to remove your account</em>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import NavHeaderEdit from '../shared/NavHeaderEdit.vue'
import ProfileTagsComponent from '@/components/profile/ProfileTagsComponent.vue'
import { includes } from 'lodash'
import debugLib from 'debug'
import fbase from '@/fbase'

const debug = debugLib('cl8.ProfileEdit')

export default {
  name: 'ProfileEdit',
  components: {
    NavHeaderEdit,
    ProfileTagsComponent
  },
  firebase: function() {
    return {
      fbpeeps: {
        source: fbase.database().ref('userlist'),
        readyCallback: function() {
          debug('data retrieved from fbase')
          this.setUserProfile()
        }
      }
    }
  },
  data() {
    return {
      items: [], // this needs to be the list from firebase
      tagList: [],
      unsyncedTags: [],
      localPhoto: null
    }
  },
  computed: {
    user() {
      return this.$store.getters.currentUser
        ? this.$store.getters.currentUser
        : false
    },
    profile() {
      return this.$store.getters.profile
    },
    profileTags: function() {
      let tagList = []

      if (this.items.length > 0) {
        this.items.forEach(function(peep) {
          if (typeof peep.fields !== 'undefined') {
            if (typeof peep.fields.tags !== 'undefined') {
              peep.fields.tags.forEach(function(t) {
                let tagListNames = tagList.map(function(tt) {
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
        this.unsyncedTags.forEach(function(t) {
          tagList.push(t)
        })
      }
      return tagList
    }
  },
  methods: {
    addTag(newTag) {
      let tempVal =
        newTag.substring(0, 2) + Math.floor(Math.random() * 10000000)
      const tag = {
        name: newTag,
        code: tempVal,
        id: 'tempval' + tempVal
      }
      this.profile.fields.tags.push(tag)
      this.unsyncedTags.push(tag)
    },
    onSubmit: function(item) {
      debug('updating profile', this.profile)
      this.$store.dispatch('updateProfile', this.profile)
    },
    updatePhoto(ev) {
      debug('image added')
      // assign the photo
      debug(ev.target.files)
      if (ev.target.files.length === 1) {
        let newPhoto = ev.target.files[0]
        this.localPhoto = window.URL.createObjectURL(newPhoto)
        let payload = { profile: this.profile, photo: newPhoto }
        this.$store.dispatch('updateProfilePhoto', payload)
      }
    },
    hasPhoto() {
      if (typeof this.profile === 'undefined') {
        return false
      }
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
    },
    showPhoto(size) {
      debug(size)
      try {
        return this.profile.fields.photo[0].thumbnails[size].url
      } catch (e) {
        debug(`error`, this.profile.fields, e)
        return this.profile.fields.photo[0].url
      }
    },
    setUserProfile() {
      debug('setting own profile for ', this.user)
      let user = this.user
      let matchingProfiles = this.items.filter(function(peep) {
        return peep.id === user.uid
      })
      if (matchingProfiles.length > 0) {
        debug('We have a match!', matchingProfiles[0])
        this.$store.commit('setProfile', matchingProfiles[0])
      } else {
        debug('No matches', matchingProfiles)
      }
    }
  },
  created() {
    this.$bindAsArray('items', this.$firebaseRefs.fbpeeps)
    debug('checking for a user:')
    debug(this.$store.getters.profile)
    debug(fbase.auth().currentUser)
    // this.$store.commit('setFBUser', fbase.auth().currentUser)
    // debug('profile', this.$store.getters.profile)
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style media="screen" lang="scss" scoped>
@import '../../../node_modules/tachyons/css/tachyons.css';
p span.list {
  display: inline-block;
}

// .new-pic-upload input.file {
//   /* // invisible but it's there! */
//   opacity: 1;
//   /* width: 100%; */
//   height: 100px;
//   position: absolute;
//   cursor: pointer;
// }

@mixin rounded($r: 5px) {
  -webkit-border-radius: $r;
  -moz-border-radius: $r;
  border-radius: $r;
}

@mixin padding() {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

/deep/ input,
textarea {
  box-sizing: border-box;
  background: #fafafa;
  border: 1px solid rgba(#000, 0.1);
  @include rounded(3px);
  padding: 0.25em 0.5em;
  font-size: 1.25rem;
}
/deep/ textarea {
  font-size: 1rem;
}
.edithover {
  position: relative;
  display: inline-block;
  width: auto;
  color: #fff;
  text-align: center;
  &:before {
    content: 'change';
    position: absolute;
    top: 0;
    left: 0;
    width: 101%;
    height: 100%;
    background-color: rgba(#09f, 0.3);
    pointer-events: none;
    opacity: 0;
    padding: 1em;
    @include padding();
    transition: all 0.2s;
  }
  &:hover {
    &:before {
      opacity: 1;
    }
  }
}
</style>
