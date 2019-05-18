const admin = require('firebase-admin')

/**
 * Return a firebase admin instance based on the service account file
 * at <project_root>/.envs/ and the FIREBASE_CONFIG env var
 */
const setupFirebaseAdmin = () => {
  if (process.env.FIREBASE_CONFIG == null)
    console.log('Missing FIREBASE_CONFIG env var')
  const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)

  const serviceAccountPath = `../../.envs/${
    adminConfig.projectId
  }-service-account.json`
  let serviceAccount = require(serviceAccountPath)

  adminConfig.credential = admin.credential.cert(serviceAccount)
  adminConfig.databaseURL = `${adminConfig.projectId}.firebaseio.com`
  admin.initializeApp(adminConfig)

  return admin
}

exports.default = setupFirebaseAdmin
