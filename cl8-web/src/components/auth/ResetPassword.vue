<template>
  <div class="w-100">

    <div class="v-mid sign-in-prompt">

      <h2 class="pt5 pl6">Constellation</h2>
      <div class="w-100 pl6">
        <div
          role="status"
          aria-live="polite"
          class="vh">
          <!--
      when there is an error, we want list it in here, to a screen reader
      can pick it up and read out the announcement
      -->
          {{ announcement }}
          <div
            v-if="errors"
            class="errors">
            <p
              v-for="(key) in errors.all()"
              :key="key">
              {{ key }}
            </p>
          </div>
        </div>
        {{ announcement }}
        <form
          @submit.prevent="sendPasswordReset">

          <div class="w-100 mb3">

            <input
              v-validate="'required|email'"
              v-model="email"
              :class=" {'bg-washed-red': errors ? errors.has('email') : null}"
              class="input-reset pa2 ba  mt1"
              type="text"
              name="email"
              placeholder="your email address"
              autocomplete="email"
              aria-label="your email address"
              @input="checkForValidFormSubmission"
            >

            <div>
              <small
                v-if="errors && errors.has('email')"
                class="red w-40">
                {{ errors.first('email') }}
              </small>
            </div>
          </div>

          <div class="mt2">
            <button
              :disabled="!formValid"
              :class="{'bg-green pointer grow': formValid}"
              class="f6 link br-pill ph3 pv2 mb2 bg-light-silver white w-50 ml0 mt2"
              type="submit"
              name="button">
              Reset Password
            </button>
          </div>

          <router-link
            :to="{ name: 'signin' }"
            class="f6 ml4">
            Back to Sign in
          </router-link>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
/* eslint-disable */
import debugLib from 'debug'
const debug = debugLib('cl8.PasswordReset')

export default {
  name: 'PasswordReset',
  data: function() {
    return {
      email: '',
      announcement: '',
      formIsValid: false
    }
  },
  methods: {
    sendPasswordReset: function() {
      debug('reset password for ', this.email)
      this.$store.dispatch('resetPassword', this.email)
      this.announcement = `OK. Password reset for ${
        this.email
      } requested. Please check your email.`
      this.email = ''
    },
    checkForValidFormSubmission: function() {
      let validation = {
        email: this.email
      }
      return this.$validator
        .validateAll(validation)
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
    formValid: function() {
      return this.formIsValid
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
</style>
