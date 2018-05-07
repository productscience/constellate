import Firebase from "firebase";
/* global process */

const FIREBASE_CONFIG = {
  apiKey: process.env.VUE_APP_FIREBASE_APIKEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASEURL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGINGSENDERID,
  functionsURL: process.env.VUE_APP_FIREBASE_FUNCTIONSURL
};

const fbase = Firebase.initializeApp(FIREBASE_CONFIG);

export default fbase;
