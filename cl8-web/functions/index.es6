const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Cl8Importer = require('./dist/importer.js')
const ProfileThumbnailer = require('./dist/profile-thumbnailer.js')
const CheckConfig = require('./dist/check-config.js')
let serviceAccount = require('./service-account.json')

// initialised it here instead of in functions
admin.initializeApp({
  serviceAccount: serviceAccount,
  databaseURL: 'https://munster-setup.firebaseio.com',
})

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

exports.generateThumbnail = functions.storage
  .object()
  .onFinalize(async object => {
    console.log('running func - generateThumbnail')
    const profThumb = ProfileThumbnailer(admin, object)

    console.log('generateThumbnail', profThumb)

    const profileId = profThumb.isProfilePic(object)

    console.log('generateThumbnail profileId', profileId)

    if (profileId) {
      const res = await profThumb.updateProfile(profileId, object)
      console.log('generateThumbnail res', res)
      console.log('profile pic thumbnails generated', res)
      return res
    }

    console.log('not a profile pic')
    return false
  })

exports.importUsers = functions.https.onRequest(async (request, response) => {
  const importerCredentials = {
    airTableCreds: [
      functions.config().airtable.key,
      functions.config().airtable.base,
    ],
    fbaseApp: admin,
  }

  const importer = Cl8Importer(importerCredentials)

  const importResults = await importer.importUsersAndTags()
  response.send(importResults.length)
})
