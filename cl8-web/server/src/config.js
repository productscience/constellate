const admin = require('firebase-admin');
const debug = require('debug')('cl8.server');

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

    debug('databaseURL', process.env.FIREBASE_DATABASEURL);
    debug('storageBucket', process.env.FIREBASE_STORAGEBUCKET);
    debug('projectId', process.env.FIREBASE_PROJECTID);

    if (
      !process.env.FIREBASE_DATABASEURL ||
      !process.env.FIREBASE_STORAGEBUCKET ||
      !process.env.FIREBASE_PROJECTID
    ) {
      throw Error("I can't find the FIREBASE environment variables. Did load them with `source path/to/env_file.sh` ?")
    }

    const adminConfig = {
      databaseURL: process.env.FIREBASE_DATABASEURL,
      storageBucket: process.env.FIREBASE_STORAGEBUCKET,
      projectId: process.env.FIREBASE_PROJECTID
    }

    let serviceAccount = require('../service-account.json')

    adminConfig.credential = admin.credential.cert(serviceAccount)
    admin.initializeApp(adminConfig)

    return admin
  }
}

exports.default = setupFirebaseAdmin
