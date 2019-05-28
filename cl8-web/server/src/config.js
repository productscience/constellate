const admin = require('firebase-admin')

/**
 * Return a firebase admin instance based on the service account file
 * at <project_root>/server/service-account.json and the FIREBASE_CONFIG env var
 */
const setupFirebaseAdmin = () => {
  const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)

  // const adminConfig = {
  //   projectId: 'cl8-testing',
  //   storageBucket: 'cl8-testing.appspot.com'
  // }

  let serviceAccount = require('../service-account.json')

  adminConfig.credential = admin.credential.cert(serviceAccount)
  adminConfig.databaseURL = `cl8-testing.firebaseio.com`
  admin.initializeApp(adminConfig)

  return admin
}

exports.default = setupFirebaseAdmin
