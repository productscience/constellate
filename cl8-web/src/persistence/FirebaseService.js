// import firebase from 'firebase'
import { FIREBASE_CONFIG } from './firebase-variables'
import EventEmitter from 'EventEmitter'
import Firebase from 'firebase'
// import axios from 'axios'
const debug = require('debug')('FirebaseService')

export default class FirebaseService {
  firebaseApp = Firebase.initializeApp(FIREBASE_CONFIG)
  fbauthNotifier = new EventEmitter()

  constructor () {
    this.db = this.db.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
  }

  db () {
    debug('connecting to the db')
    let dbase = this.firebaseApp.database()
    debug('db in firebase service', dbase)
    return dbase
  }

  handleAuthentication (user) {
    this.firebaseApp.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(userRecord => {
        debug('logged in')
        debugger
      })
      .catch(err => {
        debug('error logging in')
        console.log(err)
        debugger
      })
  }
}
