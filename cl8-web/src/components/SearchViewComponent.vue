<template>
  <li class="list peep cf ma2" :data-atid="item.id" @click="profileChosen">

    <img v-if="hasPhoto()"
      :src="item.fields.photo[0].thumbnails.small.url"
      class="supplied-photo fl b--light-silver ba" />

    <v-gravatar v-else
      :email="item.fields.email" :size="36"
      class="gravatar fl b--light-silver ba" />

    <div class="fl w60">
      <ul class="list pt0 mt0 ml0 pl1">
        <li class="name b">{{ item.fields.name }}</li>
        <li class="email">{{ item.fields.email }}</li>
        <li class="phone">{{ item.fields.phone }}</li>
        <li class="website">{{ item.fields.website }}</li>
      </ul>
    </div>
  </li>
</template>

<script>
import Vue from 'vue'
import Gravatar from 'vue-gravatar'
Vue.component('v-gravatar', Gravatar)

export default {
  props: ['item'],
  data () {
    return {}
  },
  computed: {},
  methods: {
    profileChosen (someEvent) {
      this.$emit('profileChosen', someEvent, this)
    },
    hasPhoto () {
      if (typeof this.item.fields.photo === 'undefined'){
        return false
      }
      if ( this.item.fields.photo.length > 0 ) {
        return true
      }
      // otherwise
      return false

    }
  },
  components: {
    Gravatar
  }
}
</script>
