<template>
<div class="w-100">

    <div class="v-mid sign-in-prompt">

      <h2 class="pt5 pl6">Constellation</h2>
      <div class="w-100 pl6">
        <div role="status" aria-live="polite" class="vh">
          <!--
      when there is an error, we want list it in here, to a screen reader
      can pick it up and read out the announcement
      -->
          {{ announcement }}
          <div v-if="errors" class="errors">
            <p v-for="(key, val) in errors.all()">
              {{ key }}
            </p>
          </div>
        </div>
        {{ announcement }}
        <form v-on:submit.prevent="sendPasswordReset">

          <div class="w-100 mb3">

            <input type="text" name="email" v-model="email"
              class="input-reset pa2 ba  mt1"
              :class=" {'bg-washed-red': errors ? errors.has('email') : null}"
              placeholder="your email address" aria-label="your email address"
              v-validate="'required|email'" autocomplete="email"
              @input="checkForValidFormSubmission"
            />

            <small v-if="errors && errors.has('email')" class="red ">
              {{ errors.first('email') }}
            </small>
          </div>

          <div class="mt2">
            <button class="f6 link br-pill ph3 pv2 mb2 bg-light-silver white w-50 ml0 mt2" :class="{'bg-light-green pointer grow': formValid}" :disabled="!formValid" type="submit" name="button">
                Reset Password
              </button>
          </div>
        </form>
      </div>
    </div>

</div>
</template>

<script>
/* eslint-disable */
import debugLib from 'debug'
const debug = debugLib('cl8.ResetPassword')

export default {
  name: 'PasswordResetComponent',
  data: function() {
    return {
      email: '',
      announcement: '',
      formIsValid: false
    }
  },
  methods: {
    sendPasswordReset: function () {
      debug('reset password for ', this.email)
      this.$store.dispatch('resetPassword', this.email)
      this.email = ""
      this.announcement = "Password reset requested. Please check your email"
    },
    checkForValidFormSubmission: function() {
      let validation = {
        email: this.email
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
