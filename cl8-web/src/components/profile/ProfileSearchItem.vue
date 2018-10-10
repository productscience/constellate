<template>
  <li
    v-if="hasfields()"
    :data-atid="item.id"
    class="list peep cf pa3 bb b--light-gray mid-gray hover-bg-white"

    @click="profileChosen">

    <div class="dib w-20 mw4">

      <img
        v-if="hasPhoto()"
        :src="showPhoto('large')"
        class='supplied-photo w-100'
        v-bind:class="{ 'b--green ba bw1': item.fields.pitchable }"
        >

      <v-gravatar
        v-else
        :email="item.fields.email"
        :size="64"
        class="gravatar fl b--light-silver ba" />
    </div>
    <div class="dib w-70 ph2 flex-auto v-top h3 h-auto-m overflow-hidden">
      <ul class="list pt1 mt0 ml0 pl0 pb1 f4-m">
        <li class="name mid-gray">
          {{ item.fields.name }}


        </li>
      </ul>
      <div class="dib mt1-m">
        <div
          class="dib mr2 black-30 f7 f6-m"
          v-for="tag in item.fields.tags"
          :key="tag.id">
          {{tag.name}}
          </div>
        </div>
    </div>
  </li>
</template>

<script>
import Vue from 'vue'
import Gravatar from 'vue-gravatar'
import debugLib from 'debug'
const debug = debugLib('cl8.ProfileSearchItem')
Vue.component('v-gravatar', Gravatar)

export default {
  components: {
    Gravatar
  },
  props: {
    item: {
      type: Object,
      default: function() {
        return {
          fields: {
            name: 'default',
            photo: []
          }
        }
      }
    }
  },
  data() {
    return {}
  },
  computed: {},
  methods: {
    profileChosen() {
      debug(this.item)
      this.$store.commit('setProfile', this.item)

      // if (this.$store.state.profile && this.$store.state.profile.id === this.item.id){
      // this.$store.commit('setProfile', null)
      // } else {
      // this.$store.commit('setProfile', this.item)
    },
    hasfields() {
      if (typeof this.item.fields === 'undefined') {
        return false
      }
      return true
    },
    hasPhoto() {
      if (typeof this.item.fields === 'undefined') {
        return false
      }
      if (typeof this.item.fields.photo === 'undefined') {
        return false
      }
      if (this.item.fields.photo.length > 0) {
        return true
      }
      // otherwise just return false
      return false
    },
    showPhoto(size) {
      try {
        return this.item.fields.photo[0].thumbnails[size].url
      } catch (e) {
        debug(`No thumbnails`, this.item.fields, e)
        return this.item.fields.photo[0].url
      }
    }
  }
}
</script>

<style>
li {
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
