<template>
  <div class="theprofile pa3 pa4-ns center w-100 cf border-box fixed relative-l bg-white" >

    <div v-if="loading">
      <div class="spinner">
        <img src="../../assets/loading.svg"
            alt="loading"
            width="50px">
        </div>
    </div>

    <div v-else>
        <div v-if="canEdit()" class='fn fr-l'>
        <router-link :to="{ name: 'editProfile' }"
          class="f6 link dim br2 ph3 pv2 mb3 dib white bg-gray">
          Edit profile
        </router-link>
        </div>
        <button class='closeProfile ma3 ma4-ns' @click="$store.commit('toggleProfileShowing')"></button>


        <div class="fl w-70 w-20-m w-20-l mr3">

          <img v-if="hasPhoto()"
            :src="showPhoto('large')"
            class="supplied-photo b--light-gray ba" />

          <v-gravatar v-else
            :email="profile.fields.email"
            :size="200"
            class="gravatar b--light-gray ba" />

          <div v-if="canEdit()">
              <div v-if="isVisible()"
              class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green w-100 mt2 tc">
                  Visible
              </div>
              <div v-else class="f6 link dim br2 ph3 pv2 mb2 dib white bg-red w-100 tc mt2">
                Invisible
              </div>
          </div>

        </div>


        <div class="fl w-100 w-60-m w-60-l mt0 pt0">
          <ul class="list mt0 pt0 pl0">
            <li class="list f3 name mt2 mt0-l mb2 name truncate">{{ profile.fields.name }}</li>
            <li class="list f5 email truncate mb2"><a :href="'mailto:'+profile.fields.email">{{ profile.fields.email }}</a></li>
            <li class="list f5 phone">{{ profile.fields.phone }}</li>
          </ul>

          <ul class="list pl0">
            <li
              v-if="profile.fields.website"
              class="list f5 website">
              <a :href="websiteLink"
                target="_blank">
                {{ profile.fields.website }}
              </a>
            </li>
          </ul>

          <ul class="list pl0 social-links">
            <li v-if="this.profile.fields.twitter" class="list f5 twitter dib mr1">
              <a :href="twitterLink" target="_blank">Twitter</a>
              </li>
            <li v-if="this.profile.fields.facebook" class="list f5 linkedin dib mr1">
              <a :href="facebookLink" target="_blank">Facebook</a>
              </li>
            <li v-if="this.profile.fields.linkedin" class="list f5 twitter dib mr1">
              <a :href="linkedinLink" target="_blank">LinkedIn</a>
              </li>
          </ul>
        </div>

        <div class="fl cf pt2 w-100">
          <ul class='db list tags ml0 pl0'>
            <li
              v-for="tag in profile.fields.tags" v-bind:key="tag.name"
              class="list bg-near-white br2 f7 pa2 mr1 mb1 ph3 b--light-silver bg-animate hover-bg-blue hover-white"
              :class="{ 'bg-dark-blue white': isActive(tag.name.toLowerCase()) }"
              @click="toggleTag">
                {{ tag.name.toLowerCase().trim() }}
            </li>
          </ul>

                  <div v-if="this.profile.fields.blurb" class="w-100 blurb lh-copy measure-wide">
          <div v-html="blurbOutput"></div>
        </div>
        </div>


      </div>
  </div>

</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import Gravatar from 'vue-gravatar'
import marked from 'marked'
import debugLib from 'debug'
const debug = debugLib('cl8.ProfileDetail')

Vue.component('v-gravatar', Gravatar)

import linkify from '../../utils'

export default {
  name: 'ProfileDetail',
  components: {
    Gravatar
  },
  props: ['auth', 'currentUser', 'fbtagList'],
  data() {
    return {
      loading: true
    }
  },
  computed: {
    user() {
      return this.$store.getters.currentUser
    },
    profile() {
      return this.$store.getters.profile
    },
    activeTags() {
      return this.$store.getters.activeTags
    },
    websiteLink() {
      return this.profile.fields.website
        ? linkify(this.profile.fields.website)
        : null
    },
    twitterLink() {
      return this.profile.fields.twitter
        ? linkify(this.profile.fields.twitter, 'https://twitter.com')
        : null
    },
    facebookLink() {
      return this.profile.fields.facebook
        ? linkify(this.profile.fields.facebook, 'https://facebook.com')
        : null
    },
    linkedinLink() {
      return this.profile.fields.linkedin
        ? linkify(this.profile.fields.linkedin, 'https://linkedin.com/in')
        : null
    },
    blurbOutput() {
      return this.profile.fields.blurb
        ? marked(this.profile.fields.blurb, { sanitize: true })
        : null
    }
  },
  watch: {
    profile() {
      if (this.profile) {
        this.loading = false
      }
    }
  },
  methods: {
    canEdit: function() {
      debug('can edit?', this.profile.id, this.user.uid)
      return this.profile.id == this.user.uid
    },
    toggleTag: function(ev) {
      let tag = ev.target.textContent.trim()
      this.$store.dispatch('updateActiveTags', tag)
    },
    isActive: function(term) {
      if (typeof this.activeTags !== 'undefined') {
        let matchesActiveTag = this.activeTags.indexOf(term) !== -1
        return matchesActiveTag
      }
    },
    isVisible: function() {
      return this.profile.fields.visible === 'yes'
    },
    hasPhoto() {
      if (typeof this.profile.fields === 'undefined') {
        return false
      }
      if (typeof this.profile.fields.photo === 'undefined') {
        return false
      }
      if (this.profile.fields.photo.length > 0) {
        return true
      }
      // otherwise just return false
      return false
    },
    showPhoto(size) {
      try {
        return this.profile.fields.photo[0].thumbnails[size].url
      } catch (e) {
        debug(`error`, this.profile.fields, e)
        return false
      }
    }
  },
  created() {
    debug('created!', this.profile)
    if (!this.profile || this.profile.id == this.user.uid) {
      this.loading = true
      debug(
        'no profile seen, or the current needs a refresh. Loading profile for user'
      )
      this.$store
        .dispatch('fetchProfile', this.user.uid)
        .then(() => {
          debug('loaded the user profile')
          this.loading = false
        })
        .catch(err => {
          debug("couldn't load profile", error)
        })
    } else {
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
ul.tags li.list {
  display: inline-block;
}
img.gravatar {
  box-shadow: 3px 3px 3px #ddd;
}

/* this only shows a border when we have two or more links in a row */
.social-links li + li {
  border-left: 1px solid #000000;
  padding-left: 1em;
}

@mixin animation($name,$times:infinite,$duration:0.5s,$ease:ease-out,$direction:forwards) {
  @keyframes #{$name} {
    @content;
  }
  @-moz-keyframes #{$name} {
    @content;
  }
  @-webkit-keyframes #{$name} {
    @content;
  }
  -webkit-animation: $name $ease $times;
  -moz-animation: $name $ease $times;
  animation: $name $ease $times;
  -webkit-animation-fill-mode: $direction;
  -moz-animation-fill-mode: $direction;
  animation-fill-mode: $direction;
  animation-duration: $duration;
}
@mixin transform($arguments) {
  -webkit-transform: $arguments;
  -moz-transform: $arguments;
  -o-transform: $arguments;
  -ms-transform: $arguments;
  transform: $arguments;
}
.theprofile {
  top: 0;
  left: 0;
  // width:100vw;
  height: 100vh;
  overflow: auto;
  @media screen and (max-width: 960px) {
    @include animation(profilein, 1, 0.25s, ease-in-out) {
      from {
        opacity: 0;
        @include transform(translateX(0vw));
      }
      to {
        opacity: 1;
        @include transform(translateX(0vw));
      }
    }
  }
}
.closeProfile {
  position: absolute;
  top: 0;
  right: 0;
  width: 2rem;
  height: 2rem;
  background: #fff;
  border: 0;
  outline: none;
  background-image: url('../../assets/cross-thin.svg');
  background-size: contain;
  @media screen and (min-width: 960px) {
    display: none;
  }
}
</style>
