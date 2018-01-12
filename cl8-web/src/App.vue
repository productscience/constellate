<template>
  <div id="app" class="cf debug">
    <router-view></router-view>
  </div>
</template>

<script>
/* eslint-disable */
import debugLib from 'debug'

// eslint-disable-next-line
const debug = debugLib('cl8.App')

export default {
  components: {},
  name: 'app',
  data () {
    return {}
  },
  methods: {},
  created () {
    this.$store.dispatch('tryAutoLogin')

  }
}
</script>
