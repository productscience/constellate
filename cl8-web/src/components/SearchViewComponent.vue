<template>
  <li class="list peep" :data-atid="item.id" @click="profileChosen">
    <v-gravatar :email="item.fields.email"  />
    <p class="name">{{ item.fields.Name }}</p>
    <p>{{ item.fields.email }}</p>
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
    }
  },
  components: {
    Gravatar
  }
}
</script>
