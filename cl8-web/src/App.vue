<template>
  <div id="app">
        <div class="vh-100 dt w-100 bg-dark-gray white cover">

          <div class="dtc v-mid" v-if="!authenticated">
            <h1 class="f1 f-headline-l fw1 i white-60">Constellate</h1>
            <button
              class=""
              @click="login()">
              Log In
            </button>
          </div>

          <nav class="pa3 bg-grey bb cf" v-if="authenticated" >
              <a class="link white-60 no-underline pa3 fl w-10" href="#">Constellate</a>
              <div class="fr w-3">
                <button
                  class=""
                  @click="logout()">
                  Logout
                </button>
              </div>

          </nav>

          <router-view
            :auth="auth"
            :authenticated="authenticated">
          </router-view>
          </div>
        </div>
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
