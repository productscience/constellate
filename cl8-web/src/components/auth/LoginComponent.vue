<template>
<div class="w-100">

  <div v-if="loading" class="">
    <div class="spinner">
    <img src="../../assets/loading.svg" alt="loading"/>
  </div>
  </div>

  <div v-if="!loading" class="">

  <div class="v-mid sign-in-prompt">

    <h2 class="pt5 pl6">Constellation</h2>
    <div class="w-100 pl6">
      <div role="status" aria-live="polite" class="vh">
        <!--
      when there is an error, we want list it in here, to a screen reader
      can pick it up and read out the announcement
      -->
        <div v-if="errors" class="errors">
          <p v-for="(key, val) in errors.all()">
            {{ key }}
          </p>
        </div>
      </div>
      <form v-on:submit.prevent="signIn">

        <div class="w-100 mb3">

          <input type="text" name="email" v-model="email" class="input-reset pa2 ba  mt1"
            :class=" {'bg-washed-red': errors ? errors.has('email') : null}"
            placeholder="your email address"
            aria-label="your email address"
            v-validate="'required|email'"
            autocomplete="email"
          />

          <small v-if="errors && errors.has('email')" class="red ">
          {{ errors.first('email') }}
        </small>

        </div>

        <div class="w-100">
          <input type="password" name="password" v-model="password"
            class="input-reset pa2 ba" :class=" {'bg-washed-red': errors && errors.has('password') }"
            placeholder="your password"
            v-validate="'required|min:6'"
            aria-label="your password"
            autocomplete="current-password"
            @input="checkForValidFormSubmission" />

          <small v-if="errors && errors.has('password')" class="red ">
          {{ errors.first('password') }}
        </small>
        </div>

        <div class="mt2">
          <button class="f6 link br-pill ph3 pv2 mb2 bg-light-silver white w-50 ml0 mt2" :class="{'bg-light-green pointer grow': formValid}" :disabled="!formValid" v-bind:id="formValid" type="submit" name="button">
            Sign in
          </button>
        </div>

        <router-link :to="{ name: 'resetPassword' }">Forgot password</router-link>


      </form>

    </div>
  </div>
  </div>

</div>
</template>

<script>
/* eslint-disable */
import debugLib from 'debug'
const debug = debugLib('cl8.LoginComponent')
debug('sign in page')


export default {
  name: 'LoginComponent',
  data: function() {
    return {
      email: '',
      password: null,
      announcement: '',
      formIsValid: false
    }
  },
  methods: {
    signIn: function () {
      let user = {
        email: this.email,
        password: this.password
      }
      debug(user)
      this.$store.dispatch('login', user)
    },
    checkForValidFormSubmission: function() {
      let validation = {
        email: this.email,
        password: this.password
      }
      return this.$validator.validateAll(validation)
        .then(result => {
          if (!result) {
            this.formIsValid = result
            return false
          }
          debug(result)
          this.formIsValid = result
          return result
        })
        .catch(err => {
          debug(err)
        })
    }
  },
  computed: {
    formValid: function () {
      return this.formIsValid
    },
    loading: function () {
      return this.$store.getters.isLoading
    }
  }
}
</script>

<style>
@import '../../../node_modules/tachyons/css/tachyons.css';

.sign-in-prompt {
  width: 500px;
  height: 500px;
  margin-left: auto;
  margin-right: auto;
  background-image: url(../../assets/earth-transparent.png);
  background-repeat: no-repeat;
}

.sign-in-prompt a {

  top: 175px;
  left: 145px;
}

.vh {
  position: absolute !important;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 0 !important;
  border: 0 !important;
  height: 1px !important;
  width: 1px !important;
  overflow: hidden;
}

.spinner {
  position: absolute;
  display: flex;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: white;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  }
</style>
