const fs = require('fs')
const debug = require('debug')('cl8.testutils')

const admin = require('firebase-admin')
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const serviceAccount = require(serviceAccountPath)

debug('serviceAccount: ', serviceAccount.project_id)

module.exports = testUtils

function testUtils () {
  function deleteIfPresent (filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
  function clearLocalThumbs (filePath) {
    let pattern = /thumb_/

    fs
      .readdirSync(filePath)
      .filter(path => {
        return pattern.test(path)
      })
      .forEach(thumb => {
        fs.unlinkSync(thumb)
      })
  }
  function copyfile (source, dest) {
    var fs = require('fs')

    fs.createReadStream(source).pipe(fs.createWriteStream(dest))
  }
  function firebaseAdmin () {
    debug('firebaseAdmin initialising')
    debug('FIREBASE_DATABASEURL', process.env.FIREBASE_DATABASEURL)
    debug('FIREBASE_STORAGEBUCKET', process.env.FIREBASE_STORAGEBUCKET)

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASEURL,
      storageBucket: process.env.FIREBASE_STORAGEBUCKET
    })
    debug('firebaseAdmin initialised')
    return admin
  }

  return { deleteIfPresent, clearLocalThumbs, copyfile, firebaseAdmin }
}
