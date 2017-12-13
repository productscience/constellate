const functions = require('firebase-functions')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!')
})

const admin = require('firebase-admin')
const serviceAccount = require('./service-account.json')

const auth0 = require('auth0-js')

const cors = require('cors')({ origin: true })

const auth0Web = new auth0.WebAuth({
  domain: functions.config().auth0.domain,
  clientID: functions.config().auth0.clientid
})

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().firebase.databaseURL
})

exports.delegateToken = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    console.log(req.body.userId)
    let userId = req.body.userId
    // const accessToken = req.headers.authorization.split('Bearer ')[1]

    // auth0Web.client.userInfo(accessToken, function (err, user) {
    //   if (err) {
    //     console.log(err)
    //     res.status(403).send('Unauthorized')
    //   } else {
    //     if (userId === user.user_id) {
        admin.auth().createCustomToken(userId)
            .then(function (customToken) {
              res.send(customToken)
            })
            .catch(function (error) {
              console.log('Error creating custom token:', error)
            })
        // else {
        //   res.status(403).send('Unauthorized')
        // }

  })
  // })
})
