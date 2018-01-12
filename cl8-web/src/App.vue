<template>
  <div id="app" class="cf debug">
    <router-view></router-view>
  </div>
</template>

<script>
import debugLib from 'debug'

// eslint-disable-next-line
const debug = debugLib('cl8.App')
// const fbase = FirebaseService()
// console.log(fbase)
export default {
  components: {},
  name: 'app',
  data () {
    return {}
  },
  methods: {},
  created () {}
}
</script>

<style>

</style>
