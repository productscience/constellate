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
    profileShowing: true,
    profileList: [],
    visibleProfileList: [],
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
    profileList: function(state) {
      debug('getting profileList')
      return state.profileList
    },
    profileShowing: function(state) {
      return state.profileShowing
    },
    visibleProfileList: function(state) {
      debug('getting visibleProfileList')
      return state.visibleProfileList
    },
    requestUrl: function(state) {
      return state.requestUrl
    }
  },
  mutations: {
    stopLoading: function(state) {
      state.loading = false
    },
    startLoading: function(state) {
      state.loading = true
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
      debug('setTerm', typeof payload)
      state.searchTerm = payload
    },
    setTags: function(state, payload) {
      debug('setTags', payload)
      state.searchTags = payload
    },
    setProfile: function(state, payload) {
      debug('setProfile', payload)
      state.profileShowing = true
      state.profile = payload
    },
    setProfilePhoto: function(state, payload) {
      debug('setProfilePhoto', payload)
      state.profile.fields.photo = [payload]
    },
    setProfileList: function(state, payload) {
      debug('setProfileList', payload)
      state.profileList = payload
    },
    setVisibleProfileList: function(state, payload) {
      debug('setVisibleProfileList', payload)
      state.visibleProfileList = payload
    },
    toggleProfileShowing: function(state) {
      debug('profileShowing', state.profileShowing)
      state.profileShowing = !state.profileShowing
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
    fetchProfileList: function(context) {
      fbase
        .database()
        .ref('userlist')
        .then(profileList => {
          debug('Successfully fetched profileList', profileList)
          // if we want to search and iterate through this easily
          // lets make it an array
          let profileArray = []
          _.each(profileList.val(), (val, key) => {
            profileArray.push(val)
          })
          context.commit('setProfileList', profileArray)
        })
        .catch(error => {
          debug('Error fetching profileList', error)
        })
    },
    fetchVisibleProfileList: function(context) {
      debug('fetching visible profiles')
      return new Promise((resolve, reject) => {
        fbase
          .database()
          .ref('userlist')
          .orderByChild('fields/visible')
          .equalTo('yes')
          .once('value')
          .then(visibleProfileList => {
            let profileArray = []
            _.each(visibleProfileList.val(), (val, key) => {
              profileArray.push(val)
            })

            debug(
              'Successfully fetched visibleProfileList',
              visibleProfileList.val()
            )
            // we need to turn this into an array.
            context.commit('setVisibleProfileList', profileArray)
            resolve()
          })
          .catch(error => {
            debug('Error fetching profileList', error)
            reject()
          })
      })
    },

    fetchProfile: function(context, payload) {
      debug('fetching profile for:', payload)
      return new Promise((resolve, reject) => {
        fbase
          .database()
          .ref('userlist')
          .orderByChild('id')
          .equalTo(payload)
          .limitToFirst(1)
          .once('value')
          .then(snap => {
            let firebaseKey = _.keys(snap.val())[0]
            debug('firebaseKey', firebaseKey)
            return fbase
              .database()
              .ref('userlist')
              .child(firebaseKey)
              .once('value')
              .then(userProfile => {
                debug(
                  'successfully fetched profile:',
                  payload,
                  firebaseKey,
                  userProfile
                )
                const fetchedProfile = userProfile.val()
                fetchedProfile['.key'] = firebaseKey
                context.commit('setProfile', fetchedProfile)
                resolve()
              })
          })
          .catch(err => {
            debug('setting user failed for ', payload, err)
            reject()
          })
      })
    },
    updateProfile: function(context, payload) {
      debug('sending update to Firebase', payload)

      // not super happy about this - surely there's a toJSON() method?
      let newProfile = JSON.parse(JSON.stringify(payload))
      // check if this is a profile with no pushkey, and fetch it if so
      const pushKey = newProfile['.key']

      if (!pushKey) {
        throw new Error(
          'this profile has no push key. this is needed for writing data'
        )
      }
      delete newProfile['.key']

      return fbase
        .database()
        .ref('userlist')
        .child(pushKey)
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
      const profileId = payload.profile.id
      const uploadedFileName = `profilePhotos/${profileId}-${Date.now()}`
      debug('uploadedFileName', payload.photo)
      debug('uploadedFileName', uploadedFileName)
      const metadata = {
        contentType: 'image/jpeg'
      }
      return new Promise((resolve, reject) => {
        fbase
          .storage()
          .ref()
          // we add the timestamp so photos are unique in buckets
          .child(uploadedFileName)
          .put(payload.photo, metadata)
          .then(snapshot => {
            debug('Succesfully uploaded photo', snapshot)
            // build the photo array to pass in with the profile
            let returnedPhoto = {
              url: snapshot.downloadURL,
              thumbnails: {}
            }
            // if there is no previous photo added from airtable, we need to create the
            // property
            if (typeof payload.profile.fields.photo === 'undefined') {
              payload.profile.fields.photo = []
            }
            payload.profile.fields.photo[0] = returnedPhoto
            debug(
              'payload.profile.fields.photo[0]',
              payload.profile.fields.photo[0]
            )
            context
              .dispatch('updateProfile', payload.profile)
              .then(() => {
                debug('profile updated')
                resolve()
              })
              .catch(err => {
                debug('Updating profile failed', err)
                reject()
              })

            // TODO now we need to save the updated photo on the profile
            // typically by dispatching a new action
          })
          .catch(error => {
            reject()
            debug('Saving uploaded photo: ', payload, 'failed', error)
          })
      })
    }
  }
})
