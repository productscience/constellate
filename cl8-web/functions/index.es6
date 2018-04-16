const functions = require('firebase-functions')
const Cl8Importer = require('./dist/importer.js')
const ThumbnailGenerator = require('./dist/thumbnail-generator.js')

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!')
})

exports.generateThumbnail = functions.storage.object().onFinalize(object => {
  ThumbnailGenerator(object)
})

exports.importUsers = functions.https.onRequest(async (request, response) => {
  let firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)

  const serviceAccount = firebaseConfig.fbase.path

  const importerCredentials = {
    airTableCreds: [firebaseConfig.airtable.key, firebaseConfig.airtable.base],
    fbaseCreds: [serviceAccount, firebaseConfig.databaseURL]
  }

  const importer = Cl8Importer(importerCredentials)

  const importResults = await importer.importUsersAndTags()
  response.send(importResults)
})
