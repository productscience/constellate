// import firebase from 'firebase'
import { FIREBASE_CONFIG } from './firebase-variables'
import Firebase from 'firebase'
import 'firebase/firestore'
import axios from 'axios'

export default class FirebaseService {
  firebaseApp = Firebase.initializeApp(FIREBASE_CONFIG)

  constructor () {
    this.db = this.db.bind(this)
    this.authToFireBase = this.authToFireBase.bind(this)
  }

  db () {
    let dbase = this.firebaseApp.database()
    console.log('db in firebase service', dbase)
    return dbase
  }
  authToFireBase (user) {
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
      console.log(response)
      this.firebaseApp.auth().signInWithCustomToken(response.data).catch(function (error) {
        console.log(error)
      })
    })
  }
}
