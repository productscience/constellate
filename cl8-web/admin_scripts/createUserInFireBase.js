const admin = require('firebase-admin')

var serviceAccount = require('../functions/service-account.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

admin.auth().createUser({
  uid: process.env.FIREBASE_USER_UID,
  email: process.env.FIREBASE_USER_EMAIL
}).then(function (userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
  console.log('Successfully created new user:', userRecord.uid)
  admin.app().delete()
}).catch(function (error) {
    console.log('Error creating new user:', error)
    admin.app().delete()
})
