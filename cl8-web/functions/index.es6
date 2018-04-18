const functions = require('firebase-functions')
const Cl8Importer = require('./dist/importer.js')
const ThumbnailGenerator = require('./dist/thumbnail-generator.js')
const CheckConfig = require('./dist/check-config.js')

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!')
})

// this is only used to generate a realistic objectMetaData
exports.generateSampleData = functions.storage.object().onFinalize(object => {
  console.log('data looks like this')
  console.log(object)
})

exports.checkConfig = functions.storage.object().onFinalize(object => {
  console.log(functions.config())
  return CheckConfig()
})

exports.generateThumbnail = functions.storage.object().onFinalize(object => {
  return ThumbnailGenerator(object)
})

exports.importUsers = functions.https.onRequest(async (request, response) => {
  let serviceAccount = require('./service-account.json')

  const importerCredentials = {
    airTableCreds: [
      functions.config().airtable.key,
      functions.config().airtable.base
    ],
    fbaseCreds: [serviceAccount]
  }

  const importer = Cl8Importer(importerCredentials)

  const importResults = await importer.importUsersAndTags()
  response.send(importResults.length)
})
