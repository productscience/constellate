<template>
  <div id="app" class="debug">
    <nav class="dt w-100 border-box pa3 ph5-ns">
      <a class="dtc v-mid mid-gray link dim w-25" href="#" title="Home">
        <img src="./assets/rocket.gif" class="dib w2 h2 br-100" alt="Constellate">
      </a>
      <div class="dtc v-mid w-75 tr">
        <a v-if="authenticated" class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" title="Profile">Profile</a>
        <a v-if="authenticated" class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" @click="logout()" title="Log out">Logout</a>
      </div>
    </nav>

    <div class="w-100 border-box pa3 ph5-ns" v-if="!authenticated">
      <div class="dtc v-mid" >
        <p class="f2 fw1 i grey-10 tc">
          Welcome to Constellate, an experiment in people scaled networt
        </p>
        <p>Please follow the link to sign in with your email address.</p>
        <a class="f6 br-pill bg-dark-red no-underline white ba b--dark-red grow pv2 ph3 dib mr3"
          @click="login()"
          href="#">
            Log me in
        </a>
      </div>
    </div>


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
  @import '../node_modules/tachyons/css/tachyons.css';
</style>
