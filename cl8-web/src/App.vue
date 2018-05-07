<template>
  <div id="app" class="cf bg-light-gray center w-100 mw8">
    <router-view></router-view>
  </div>
</template>

<script>
import debugLib from 'debug'
// eslint-disable-next-line
const debug = debugLib('cl8.App')

export default {
  components: {},
  name: 'app',
  data() {
    return {}
  },
  methods: {}
}
</script>

<style>
#app {
  box-shadow: 0 0 3px rgb(0, 0, 0, 0.1);
}
</style>
