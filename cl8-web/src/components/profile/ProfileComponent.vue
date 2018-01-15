<template>
  <div class="pa3 center w-80 cf" v-if="!!profile">

    <div class="cf" style="min-height:11em;">
      <div class="fl w-20">


          <img v-if="hasPhoto()"
            :src="profile.fields.photo[0].thumbnails.large.url"
            class="supplied-photo b--light-silver ba" />

          <v-gravatar v-else
            :email="profile.fields.email"
            :size="200"
            class="gravatar b--light-silver ba" />

          <div v-if="isVisible()"
          class="f6 link dim br-pill ph3 pv2 mb2 dib white bg-green w-80 ma2 tc">
              Visible
          </div>
          <div v-else class="f6 link dim br-pill ph3 pv2 mb2 dib white bg-red w-80 tc ma2">
            Invisible
          </div>


      </div>

      <div class="fl w-50 mt0 pt0">
        <ul class="list mt0 pt0">
          <li class="list f3 name">{{ profile.fields.name }}</li>
          <li class="list f3 email">{{ profile.fields.email }}</li>
          <li class="list f3 phone">{{ profile.fields.phone }}</li>
        </ul>

        <ul class="list">
          <li class="list f5 website">{{ profile.fields.website }}</li>
        </ul>

        <ul class="list">
          <li class="list f5 twitter dib mr1">
            <a :href="profile.fields.twitter">Twitter</a>
            </li>
            |
          <li class="list f5 linkedin dib mr1">
            <a :href="profile.fields.linkedin">LinkedIn</a>
            </li>
            |
          <li class="list f5 twitter dib mr1">
            <a :href="profile.fields.facebook">Facebook</a>
            </li>
        </ul>
      </div>
    </div>

    <div class="cf pt2">
      <ul class='list tags ml0 pl0'>
        <li
          v-for="tag in profile.fields.tags"
          class="list bg-white pa2 ma1 ph3 b--light-silver ba br2 bg-animate hover-bg-blue hover-white"
          :class="{ 'bg-dark-blue white': isActive(tag.name) }"
          @click="toggleTag">
          {{ tag.name }}
        </li>
      </ul>
    </div>

    <div v-if="canEdit">
      <hr>
        <router-link :to="{ name: 'editProfile' }"
          class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green">
          Edit
        </router-link>
      </p>
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
const debug = debugLib('cl8.ProfileComponent')
Vue.component('v-gravatar', Gravatar)

export default {
  name: 'ProfileComponent',
  components: {
    Gravatar
  },
  props: ['auth', 'currentUser', 'fbtagList'],
  data() {
    return {}
  },
  computed: {
    user() {
      return this.$store.getters.currentUser
    },
    profile () {
      return this.$store.getters.profile
    },
    activeTags () {
      return this.$store.getters.activeTags
    }
  },
  methods: {
    canEdit: function () {
      debug(this.profile, this.user)
      return this.profile.id === this.user
    },
    toggleTag: function (ev) {
      let tag = ev.target.textContent.trim()
      this.$store.dispatch('updateActiveTags', tag)
    },
    isActive: function (term) {
      if (typeof this.activeTags !== 'undefined') {
          let matchesActiveTag = this.activeTags.indexOf(term) !== -1
          return matchesActiveTag
        }
    },
    isVisible: function () {
      return this.profile.fields.visible === 'yes'
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
      // otherwise just return false
      return false
    }
  },
  filters: {
    marked: marked
  }
}
</script>

<style>
  ul.tags li.list {
    display:inline-block;
  }
  img.gravatar {
    box-shadow: 3px 3px 3px #ddd;
  }
</style>
