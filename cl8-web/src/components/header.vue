<template>
<nav class="dt w-100 border-box pa3 ph5-ns bb b--black-10 bg-white">

  <div class="dtc v-mid w-75 tr">
    <input
      placeholder="search across everything"
      class="input-reset b--black-20 pa2 mr1 w-20"
      name="search-term"
      @input="updateSearchTerm"
       />
    <a href="#"
      class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns"
      @click="myProfile" title="my profile">
      my profile
    </a>
    <a href="#"
      class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns"
      @click="logout" title="log out">
      log out
  </a>
  </div>
</nav>
</template>

<script>
import debugLib from 'debug'
const debug = debugLib('cl8.Header')
export default {
  name: 'Header',
  methods: {
    updateSearchTerm (ev) {
      let term = ev.target.value.trim()
      debug(term)
      this.$store.commit('setTerm', term)
    },
    logout: function () {
      debug('log out')
      this.$store.dispatch('logout')
    }
  }
}
</script>
