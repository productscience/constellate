<template>
<nav class="dt w-100 border-box pa3 bb b--light-gray bg-white">

  <div class="v-mid flex-ns items-stretch tr-s">
    <span
      class="link dark-gray f6 nowrap f6-ns dib fr fn-ns pointer pt0 pb3 pa2-m pa2-l ph3 v-mid order-1 tr"
      @click="myProfile" title="my profile">
      my profile
    </span>
    <span
      class="link dark-gray f6 nowrap f6-ns dib fr fn-ns pointer pt0 pb3 pa2-m pa2-l ph3 v-mid order-1 tr"
      @click="logout" title="log out">
      log out
    </span>
    <div class='w-100 order-0'>
      <input
        placeholder="search"
        class="input-reset ba br2 b--light-gray pa2 mr1 w-100 border-box"
        name="search-term"
        @input="updateSearchTerm"
        />
    </div>
  </div>
</nav>
</template>

<script>
import debugLib from 'debug'
const debug = debugLib('cl8.NavHeaderLoggedIn.vue')
export default {
  name: 'Header',
  methods: {
    updateSearchTerm(ev) {
      let term = ev.target.value.trim()
      debug(term)
      this.$store.commit('setTerm', term)
    },
    logout: function() {
      debug('log out')
      this.$store.dispatch('logout')
    },
    myProfile: function() {
      debug('setting profile back to user')
      this.$store.dispatch('fetchProfile', this.$store.getters.currentUser.uid)
      // this.$emit('myProfile')
    }
  }
}
</script>
<style lang="scss">
.dtc span {
  cursor: pointer;
}
// TODO check the a11y implications of this style - I think it screws screen readers
input {
  outline-style: none;
}
</style>
