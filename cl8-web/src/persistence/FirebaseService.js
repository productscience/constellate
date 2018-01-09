// import firebase from 'firebase'
import { FIREBASE_CONFIG } from './firebase-variables'
import EventEmitter from 'EventEmitter'
import Firebase from 'firebase'
import axios from 'axios'
const debug = require('debug')('FirebaseService')

export default class FirebaseService {
  firebaseApp = Firebase.initializeApp(FIREBASE_CONFIG)
  fbauthNotifier = new EventEmitter()

  constructor () {
    this.db = this.db.bind(this)
    this.authToFireBase = this.authToFireBase.bind(this)
  }

  db () {
    debug('connecting to the db')
    let dbase = this.firebaseApp.database()
    debug('db in firebase service', dbase)
    return dbase
  }

  authToFireBase (user) {
    debug('user:', user)
    axios({
      method: 'post',
      data: {
        userId: user['https://cl8.io/firebaseId']
      },
      baseURL: FIREBASE_CONFIG.functionsURL,
      url: '/delegateToken'
      // headers: {
      //   Authorization: 'Bearer ' +
      // }
    })
    .then(response => {
      return this.firebaseApp.auth().signInWithCustomToken(response.data)
      .then(userRecord => {
        this.fbauthNotifier.emit('authChange', { authedUser: userRecord.email })
        return userRecord
      }).catch(function (error) {
        console.log(error)
      })
    })
  }
}
