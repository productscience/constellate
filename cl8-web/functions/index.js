const functions = require('firebase-functions')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!')
})

const admin = require('firebase-admin')
const serviceAccount = require('./constellation-dgen.service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().firebase.databaseURL
})
