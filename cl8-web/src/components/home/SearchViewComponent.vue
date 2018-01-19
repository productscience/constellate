<template>
  <li class="list peep cf ma2" :data-atid="item.id" @click="profileChosen"
  v-if="hasfields()">

    <img v-if="hasPhoto()"
      :src="item.fields.photo[0].thumbnails.small.url"
      class="supplied-photo fl b--light-silver ba" />

    <v-gravatar v-else
      :email="item.fields.email" :size="36"
      class="gravatar fl b--light-silver ba" />

    <div class="fl w60">
      <ul class="list pt2 mt0 ml0 pl1">
        <li class="name b">{{ item.fields.name }}</li>
      </ul>
    </div>
  </li>
</template>

<script>
import Vue from 'vue'
import Gravatar from 'vue-gravatar'
import debugLib from 'debug'
const debug = debugLib('cl8.SearchViewComponent')
Vue.component('v-gravatar', Gravatar)

export default {
  props: ['item'],
  data () {
    return {}
  },
  computed: {},
  methods: {
    profileChosen () {
      debug(this.item)
      this.$store.commit('setProfile', this.item)
    },
    hasfields () {
      if (typeof this.item.fields === 'undefined') {
        return false
      }
      return true
    },
    hasPhoto () {
      if (typeof this.item.fields === 'undefined') {
        return false
      }
      if (typeof this.item.fields.photo === 'undefined') {
        return false
      }
      if (this.item.fields.photo.length > 0) {
        return true
      }
      // otherwise jjust return false
      return false
    }
  },
  components: {
    Gravatar
  }
}
</script>
