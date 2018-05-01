/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import router from './routes'
import fbase from './fbase'

const debug = require('debug')('cl8.store')

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    loading: true,
    searchTerm: '',
    searchTags: [],
    profile: null,
    profilePhoto: null,
    requestUrl: null
  },
  getters: {
    currentUser: function(state) {
      return state.user
    },
    isLoading: function(state) {
      return state.loading
    },
    currentTerm: function(state) {
      return state.searchTerm
    },
    activeTags: function(state) {
      debug('activeTags', state.searchTags)
      return state.searchTags
    },
    profile: function(state) {
      return state.profile
    },
    //
    profilePhoto: function(state) {
      return state.profilePhoto
    },
    requestUrl: function(state) {
      return state.requestUrl
    }
  },
  mutations: {
    stopLoading: function(state) {
      state.loading = false
    },
    setFBUser: function(state) {
      debug('setFBUser', state.user)
      const user = fbase.auth().currentUser
      if (user) {
        state.user = user.toJSON()
        debug('setFBUser - state user', state.user.displayName, state.user)
      }
    },
    clearFBUser: function(state) {
      debug('clearFBUser', state.user)
      state.user = null
    },
    setTerm: function(state, payload) {
      debug('setTerm', payload)
      state.searchTerm = payload
    },
    setTags: function(state, payload) {
      debug('setTags', payload)
      state.searchTags = payload
    },
    setProfile: function(state, payload) {
      debug('setProfile', payload)
      state.profile = payload
    },
    setProfilePhoto: function(state, payload) {
      debug('setProfilePhoto', payload)
      state.profile.fields.photo = [payload]
    },
    setRequestUrl: function(state, payload) {
      debug('setrequestUrl', payload)
      state.requestUrl = payload
    }
  },
  actions: {
    // otherwise log user in here
    login: function(context, payload) {
      debug(payload)
      fbase
        .auth()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            debug('we can log in now')
            debug(user)
            context.commit('setFBUser', user)
            // if there's no previous url, send them to home
            if (context.getters.requestUrl) {
              debug('pushing to original req url: ', context.getters.requestUrl)
              router.push(context.getters.requestUrl)
            } else {
              debug('pushing to home')
              router.push({ name: 'home' })
            }
          },
          error => {
            alert(error.message)
          }
        )
    },
    logout: function(context) {
      fbase
        .auth()
        .signOut()
        .then(function() {
          // Sign-out successful.
          context.commit('clearFBUser')
          router.push('signin')
        })
        .catch(function(error) {
          // An error happened
          debug('Logout Failed!', error)
        })
    },
    resetPassword: function(context, payload) {
      debug('send password reset for ', payload)
      fbase
        .auth()
        .sendPasswordResetEmail(payload)
        .then(function() {
          // Email sent.
          debug('password reset requested', payload)
        })
        .catch(function(error) {
          // An error happened.
          debug('Problem sending password: ', error)
        })
    },
    updateActiveTags: function(context, payload) {
      debug('updateActiveTags', payload)
      let tag = payload
      let tags = context.state.searchTags
      debug('tags', tags)
      if (tags.indexOf(tag) !== -1) {
        let index = tags.indexOf(tag)
        tags.splice(index, 1)
      } else {
        tags.push(tag)
      }
      context.commit('setTags', tags)
    },
    updateProfile: function(context, payload) {
      debug('sending update to Firebase', payload)

      // not super happy about this - surely there's a toJSON() method?
      let newProfile = JSON.parse(JSON.stringify(payload))
      delete newProfile['.key']
      fbase
        .database()
        .ref('userlist')
        .child(payload['.key'])
        .set(newProfile)
        .then(() => {
          debug('Succesfully saved')
          router.push({ name: 'home' })
        })
        .catch(error => {
          debug('Error saving profile: ', payload, 'failed', error)
        })
    },
    updateProfilePhoto: function(context, payload) {
      debug('sending photo update to Firebase', payload)
      let profileId = payload.profile.id
      var metadata = {
        contentType: 'image/jpeg'
      }
      fbase
        .storage()
        .ref()
        // we add the timestamp so photos are unique in buckets
        .child(`profilePhotos/${profileId}-${Date.now()}`)
        .put(payload.photo, metadata)
        .then(snapshot => {
          debug('Succesfully uploaded photo', snapshot)
          // build the photo array to pass in with the profile
          let returnedPhoto = {
            url: snapshot.downloadURL,
            thumbnails: {}
          }
          context.commit('setProfilePhoto', returnedPhoto)
        })
        .catch(error => {
          debug('Saving uploaded photo: ', payload, 'failed', error)
        })
    }
  }
})
