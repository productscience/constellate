<template>
  <div class="pa4 center w-80 cf tc">
    <form @submit.prevent="confirmPhoto" v-if="profile">
      <img v-if="localPhoto" :src="this.localPhoto" class="supplied-photo dib b--light-silver ba">

      <img
        v-if="hasPhoto() && !localPhoto"
        :src="showPhoto('large')"
        class="supplied-photo dib b--light-silver ba"
      >

      <v-gravatar
        v-else-if="!localPhoto"
        :email="profile.fields.email"
        :size="200"
        class="gravatar dib b--light-silver ba"
      />
      <input type="file" @change="updatePhoto($event)" class="ma2 br2" accept="image/*" id="file">
      <div class="nav tc">
        <button class="f6 link dim br2 ph3 pv2 mb2 mr2 dib bn white bg-green">Confirm</button>
        <router-link
          :to="{ name: 'editProfile' }"
          class="f6 link dim br2 ph3 pv2 mb2 dib white bg-gray"
        >Cancel</router-link>
      </div>
    </form>

    <!-- <h2>profile: {{ profile }}</h2>
    <hr>
    <h2>user: {{ user }}</h2>-->
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
    return {
      localPhoto: null,
      localPhotoUpload: null
    }
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
      try {
        return this.profile.fields.photo[0].thumbnails[size].url
      } catch (e) {
        debug(`error`, e)
        return this.profile.fields.photo[0].url
      }
    },
    updatePhoto(ev) {
      debug('image added')
      // assign the photo
      debug(ev.target.files)
      if (ev.target.files.length === 1) {
        let newPhoto = ev.target.files[0]
        this.localPhoto = window.URL.createObjectURL(newPhoto)
      }
    },
    confirmPhoto(ev) {
      // ev.target[0].files[0] is the first file in the file input
      // we really ought to have a better way to refer to it, probably by
      // setting an entry in the component data() method
      let payload = { profile: this.profile, photo: ev.target[0].files[0] }
      debug('sending to firebase', payload)
      this.$store.dispatch('updateProfilePhoto', payload)
    }
  },
  created() {
    this.$store.commit('startLoading')
    if (!this.profile) {
      this.$store
        .dispatch('fetchProfile', this.user.uid)
        .then(values => {
          debug('loaded the profiles in the component')
          this.$store.commit('stopLoading')
        })
        .catch(err => {
          debug("couldn't load in the component: ", payload, 'failed', error)
        })
    }
  }
}
</script>

<style lang="scss">
@import '../../../node_modules/tachyons/css/tachyons.css';
@mixin padding() {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
img.supplied-photo {
  max-width: 200px;
}
input[type='file'] {
  border: 1px solid rgba(#09f, 0.1);
  display: block;
  width: 100%;
  background: rgba(#09f, 0.1);
  cursor: pointer;
  padding: 1em;
  max-width: 24rem;
  margin: 1em auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @include padding();
}
</style>
