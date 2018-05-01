<template>
  <div class="pa3 center w-80 cf">

    <div>
      <h2>profile: {{ profile }}</h2>
      <hr>
      <h2>user: {{ user }}</h2>

    <div v>
      <hr>
        <router-link :to="{ name: 'editProfile' }"
          class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green">
          Cancel
        </router-link>
    </div>

    </div>

  </div>
</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import debugLib from 'debug'

const debug = debugLib('cl8.ProfilePhoto')

export default {
  name: 'ProfilePhoto',
  components: {},
  props: [],
  data() {
    return {}
  },
  computed: {
    user() {
      return this.$store.getters.currentUser
    },
    profile() {
      return this.$store.getters.profile
    }
  },
  methods: {
    canEdit: function() {
      debug('can edit?', this.profile.id, this.user.uid)
      return this.profile.id == this.user.uid
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
      // otherwise just return false
      return false
    },
    showPhoto(size) {
      return this.profile.fields.photo[0].thumbnails[size].url
    }
  }
}
</script>

<style>

</style>
