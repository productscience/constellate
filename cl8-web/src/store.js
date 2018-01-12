/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import router from './routes'

import Firebase from 'firebase'
import { FIREBASE_CONFIG } from './persistence/firebase-variables'
const debug = require('debug')('cl8.store')

const fbase = Firebase.initializeApp(FIREBASE_CONFIG)
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null
  },
  getters: {
    currentUser: function (state) {
      return state.user
    }
  },
  mutations: {
    setFBUser: function (state) {
      debug('setFBUser', state.user)
      const user = fbase.auth().currentUser
      if (user) {
        state.user = user.toJSON()
        debug('setFBUser', state.user)
      }
    }

  },
  actions: {
    tryAutoLogin: function (context) {
      // check if firebase has a user when we intialise it.
      // if so, set it
      context.commit('setFBUser')
    },
    // otherwise log user in here
    login: function (context, payload) {
      debug(payload)
      fbase.auth()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            debug(user)
            context.commit('setFBUser', user)
          },
          error => {
            alert(error.message);
          }
        );

    }
  }
})
