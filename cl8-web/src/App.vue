<template>
  <div id="app" class="cf">
    <router-view></router-view>
  </div>
</template>

<script>
import debugLib from 'debug'

import fbase from './fbase'
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

    debug('adding a listener to sign into firebase')

    // without this, a user needs to sign-in each time
    fbase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        debug("we're already logged in", firebaseUser)
        this.$store.dispatch('autoLogin', firebaseUser)
        this.$router.replace('home')
      }
      else {
        debug('nope. Nothing')
        this.$store.commit('stopLoading')
        this.$router.replace('signin')
      }
    })
  }
}
</script>
