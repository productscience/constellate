<template>
  <div id="app">
      <article class="">
        <div class="vh-100 dt w-100 tc bg-dark-gray white cover">

          <div class="dtc v-mid">
            <h1 class="f1 f-headline-l fw1 i white-60">Constellate</h1>
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
        </div>
    </article>
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
  @import '../node_modules/tachyons/css/tachyons.css';
</style>
