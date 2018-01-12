/* global localStorage */
/* eslint-disable */
import { FIREBASE_CONFIG } from './firebase-variables'
import EventEmitter from 'EventEmitter'
import Firebase from 'firebase'
import router from './../router'

const debug = require('debug')('cl8.FirebaseService')

function FireBaseService () {
//   let firebaseApp =
//   let fbauthNotifier = new EventEmitter()
//
//
//   function db () {
//     debug('connecting to the db')
//     let dbase = firebaseApp.database()
//     debug('db in firebase service', dbase)
//     return dbase
//   }
//
//
//   function handleAuthentication (user) {
//     debug('logging in')
//     firebaseApp.auth().signInWithEmailAndPassword(user.email, user.password)
//       .then(userRecord => {
//         debug('logged in')
//         // setSession(userRecord)
//
//       })
//       .catch(err => {
//         debug('error logging in')
//         console.log(err)
//         // debugger
//       })
//   }
//   function logout () {
//     return firebaseApp.auth().signOut()
//   }
//   function isAuthenticated () {
//     // Check whether the current time is past the
//     // access token's expiry time
//     return !!firebaseApp.auth().currentUser
//
//   }
//
//   return {
//     login: handleAuthentication,
//     logout: logout,
//     fbase: firebaseApp,
//     fbauthNotifier: fbauthNotifier,
//     db: db,
//     isAuthenticated: isAuthenticated
//   }
  return Firebase.initializeApp(FIREBASE_CONFIG)
}


export default FireBaseService
