const admin = require('firebase-admin')

/**
 * Return a firebase admin instance
 *
 * For development environments this is based on the service account file
 * at <project_root>/server/service-account.json and the FIREBASE_CONFIG env var
 */
const setupFirebaseAdmin = () => {
  if (process.env.NODE_ENV === 'production') {
    // See server README.md for setup instructions
    admin.initializeApp()
    return admin
  } else {
    console.log('Loading config', process.env.FIREBASE_CONFIG)
    const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)

    let serviceAccount = require('../service-account.json')

    adminConfig.credential = admin.credential.cert(serviceAccount)
    // adminConfig.databaseURL = `cl8-testing.firebaseio.com`
    admin.initializeApp(adminConfig)

    return admin
  }
}

exports.default = setupFirebaseAdmin
