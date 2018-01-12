
import { FIREBASE_CONFIG } from './persistence/firebase-variables'
import Firebase from 'firebase'

const fbase = Firebase.initializeApp(FIREBASE_CONFIG)

export default fbase
