<template>
  <div id="app" class="cf">

    <div class="w-100 border-box pa3 ph5-ns bg-white" v-if="!authenticated" >
      <div class="v-mid sign-in-prompt relative">

        <h2 class="absolute" style="top: 120px; left: 145px;">Constellation</h2>
        <login-component
          class=""
          :fbase=fbase>
        </login-component>

      </div>
    </div>



    <router-view

        :fbase="fbase"
        >
    </router-view>

  </div>

</template>

<script>
import LoginComponent from './components/LoginComponent.vue'
// import AuthService from './auth/AuthService'
import FirebaseService from './persistence/FirebaseService'

// const auth = new AuthService()
// const { login, logout, authenticated, authNotifier } = auth
const fbase = new FirebaseService()

export default {
  components: {
    LoginComponent
  },
  name: 'app',
  data () {
    // authNotifier.on('authChange', authState => {
    //   this.authenticated = authState.authenticated
    // })
    // TODO decide whether we should add a listener here with firebase auth
    // so we have the sign-in logic for both systems in the top level
    return {
      profile: {
        'createdTime': '--',
        'fields': {
          'name': '--',
          'tags': [
          ],
          'email': '--',
          'visible': 'yes'
        },
        'id': '--'
      },
      // auth,
      // authenticated,
      // authNotifier,
      // logout,
      fbase
    }
  },
  methods: {
    // login,
    // showProfile: function (profile) {
      // this.profile = profile
    // }
  }
}
</script>

<style>
  @import '../node_modules/tachyons/css/tachyons.css';

  .sign-in-prompt{
    width: 500px;
    height: 500px;
    margin-left:auto;
    margin-right:auto;
    background-image: url(assets/earth-transparent.png);
    background-repeat: no-repeat;
  }
  .sign-in-prompt a{

    top: 175px;
    left: 145px;
  }


  .bg-network{

  }
</style>
