<template>
<div>
  <div role="status" aria-live="polite">
  </div>
  <form v-on:submit.prevent="signIn">

    <input type="text" name="email" v-model="email"
      placeholder="your email address"
      autocomplete="email" aria-label="your email address">

    <input type="password" name="password" v-model="password"
      placeholder="your password"
      aria-label="your password" autocomplete="current-password">

    <button type="submit" name="button">Sign in </button>
  </form>

</div>
</template>

<script>
export default {
  name: 'LoginComponent',
  props: ['fbase'],
  // data () {
  //   this.auth.handleAuthentication(window.location.hash)
  //   return {}
  // }
  methods: {
    signIn: function () {
      console.log(this.fbase)
      let user = {
        email: this.email,
        password: this.password
      }
      let loginResponse = this.fbase.handleAuthentication(user)
      console.log(loginResponse)
    },
    validSubmission: function () {
      console.log(this)
      return true
    },
  }
}
</script>

<style>
</style>
