<template>
  <li class="list peep cf ma2" :data-atid="item.id" @click="profileChosen">

    <v-gravatar :email="item.fields.email" :size="50" class="fl b--light-silver ba" />

    <div class="fl w60">
      <ul class="list pt0 mt0 ml0 pl1">
        <li class="name b">{{ item.fields.Name }}</li>
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
    }
  },
  components: {
    Gravatar
  }
}
</script>
