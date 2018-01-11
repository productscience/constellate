<template>
<div>
  <div role="status" aria-live="polite">
    </div>
  <form v-on:submit.prevent="signIn">

    <div class="">
      <small v-if="errors && errors.has('email')"
        class="help is-danger">
        {{ errors.first('email') }}
      </small>
    </div>
    <input type="text" name="email" v-model="email"
      class="input-reset pa2 ba mb3 mt1 w-70"
      :class="{'bg-light-red': errors && errors.has('email') }"
      placeholder="your email address"
      aria-label="your email address"
      v-validate="'required|email'"
      autocomplete="email" >


    <input type="password" name="password" v-model="password"
      class="input-reset pa2 ba w-70"
      placeholder="your password"
      aria-label="your password" autocomplete="current-password">

    <div class="mt2">
      <button
        class="f6 link dim br-pill ph3 pv2 mb2 dib bg-light-silver white w-50 ml4 mt2"
        :class="{'bg-light-green': validity }"
        :disabled="errors && errors.any()"
        type="submit" name="button">
        Sign in
      </button>
    </div>

  </form>

</div>
</template>

<script>

export default {
  name: 'LoginComponent',
  props: ['fbase'],
  data: function () {
    return {
      email: '',
      password: null
    }
  },
  methods: {
    signIn: function () {
      // console.log(this.fbase)
      // let user = {
      //   email: this.email,
      //   password: this.password
      // }
      console.log(this.$validator.fields)
      // let loginResponse = this.fbase.handleAuthentication(user)
      // console.log(loginResponse)
    }
  },
  computed: {
    validity: function () {
      console.log(this)
    }
  }
}
</script>

<style>
@import '../../node_modules/tachyons/css/tachyons.css';

.sign-in-prompt{
  width: 500px;
  height: 500px;
  margin-left:auto;
  margin-right:auto;
  background-image: url(../assets/earth-transparent.png);
  background-repeat: no-repeat;
}
.sign-in-prompt a{

  top: 175px;
  left: 145px;
}


.bg-network{

}
</style>
