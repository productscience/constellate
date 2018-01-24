const functions = require('firebase-functions')
const Cl8Importer = require('./dist/importer.js')

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!')
})

exports.showConfig = functions.https.onRequest((request, response) => {
  response.send(functions.config())
})

exports.importUsers = functions.https.onRequest(async (request, response) => {
  const serviceAccount = require(functions.config().fbase.path)

  const importerCredentials = {
    airTableCreds: [
      functions.config().airtable.key,
      functions.config().airtable.base
    ],
    fbaseCreds: [serviceAccount, functions.config().firebase.databaseURL]
  }

  const importer = Cl8Importer(importerCredentials)

  const importResults = await importer.importUsersAndTags()
  response.send(importResults)
})
