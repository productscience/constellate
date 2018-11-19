<template>
  <div class="w-100">

    <div class="v-mid sign-in-prompt pa3">

      <h2 class="pt5 fw3 tracked tc">Constellation</h2>
      <div class="w-100 tc">
        <div
          role="status"
          aria-live="polite"
          class="vh" v-html="announcement">
          <!--
      when there is an error, we want list it in here, so a screen reader
      can pick it up and read out the announcement
      -->
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
        <div
        	v-html="announcement">
        </div>

        <form
			v-if="!requestSuccess"
          @submit.prevent="sendPasswordReset" class='mw6 tc center ph5'>

          <div class="w-100 mb3">

            <input
              v-validate="'required|email'"
              v-model="email"
              :class=" {'bg-washed-red': errors ? errors.has('email') : null}"
              class="input-reset pa2 ba mt1 w-100 b--light-gray br2"
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

          <div class="mt2 cf">
            <button
              :disabled="!formValid"
              :class="{'bg-orange hover-bg-dark-orange pointer grow': formValid}"
              class="f6 link br2 bn pv2 mb2 bg-light-silver white w-50 ml0 mt2 mr3 fl"
              type="submit"
              name="button">
              Reset Password
            </button>

            <router-link
	            :to="{ name: 'signin' }"
	            class="f7 gray link w-40 fr dib pv3">
	            Back to Sign in
	        </router-link>
          </div>

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
      formIsValid: false,
      requestSuccess: false
    }
  },
  methods: {
    sendPasswordReset: function() {
      debug('reset password for ', this.email)
      this.$store.dispatch('resetPassword', this.email)
      this.announcement = `Password reset for ${
        this.email
      } requested. <br/><br/>
       Please check your email. <br/><br/>
       You may close this window.`
      this.email = ''
      this.requestSuccess = true
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
  margin-left: auto;
  margin-right: auto;
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
