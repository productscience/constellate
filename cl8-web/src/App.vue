<template>
  <div id="app">
    <img src="./assets/logo.png">
    <button
      class=""
      v-if="!authenticated"
      @click="login()">
      Log In
    </button>

    <button
      class="link dim black b f6 f5-ns dib mr3"
      v-if="authenticated"
      @click="logout()">
      Log Out
    </button>

    <router-view
      :auth="auth"
      :authenticated="authenticated">
    </router-view>
  </div>
</template>

<script>
import AuthService from './auth/AuthService'
const auth = new AuthService()
const { login, logout, authenticated, authNotifier } = auth

export default {
  name: 'app',
  data () {
    authNotifier.on('authChange', authState => {
      this.authenticated = authState.authenticated
    })

    return {
      auth,
      authenticated
    }
  },
  methods: {
    login,
    logout
  }
}
</script>

<style>
</style>
