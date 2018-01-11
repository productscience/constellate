<template>
<div class="w-100">
  <div role="status" aria-live="polite">
    </div>
  <form v-on:submit.prevent="signIn">

    <div class="w-100 mb3">

      <input type="text" name="email" v-model="email"
        class="input-reset pa2 ba  mt1 w-50"
        :class="{'bg-washed-red': errors && errors.has('email') }"
        placeholder="your email address"
        aria-label="your email address"
        v-validate="'required|email'"
        autocomplete="email" />

      <small v-if="errors && errors.has('email')"
        class="red ">
        {{ errors.first('email') }}
      </small>

    </div>

    <div class="w-100">
      <input type="password" name="password" v-model="password"
        class="input-reset pa2 ba w-50"
        placeholder="your password"
        aria-label="your password" autocomplete="current-password">
    </div>

    <div class="mt2">
        <button
          class="f6 link dim br-pill ph3 pv2 mb2 dib bg-light-silver white w-50 ml0 mt2"
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
      // console.log(this.$validator.fields)
      // let loginResponse = this.fbase.handleAuthentication(user)
      // console.log(loginResponse)
    }
  },
  computed: {
    validity: function () {
      console.log(this.email)
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
