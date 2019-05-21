'use strict'

const setupFbaseAdmin = require('./src/config.js').default
const functions = require('firebase-functions')
const Cl8Importer = require('./src/importer.js')
const ProfileThumbnailer = require('./src/profile-thumbnailer.js')
const CheckConfig = require('./src/check-config.js')
const { checkAdmin } = require('./src/auth.js')
const cors = require('cors')({ origin: true })

const admin = setupFbaseAdmin()

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Constellate Cloud Function!')
})

// this is only used to generate a realistic objectMetaData
exports.generateSampleData = functions.storage.object().onFinalize(object => {
  console.log('data looks like this')
  console.log(object)
})

exports.checkConfig = functions.storage.object().onFinalize(object => {
  // console.log(functions.config())
  return CheckConfig()
})

exports.generateThumbnail = functions.storage
  .object()
  .onFinalize(async object => {
    console.log('running func - generateThumbnail')
    console.log('admin', admin)
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
      functions.config().airtable.base
    ],
    fbaseApp: admin
  }

  const importer = Cl8Importer(importerCredentials)

  const importResults = await importer.importUsersAndTags()
  response.send(importResults.length)
})

/** 
 * Endpoint that creates a Firebase user account and user profile
 * 
 * Expects POST request with JSON formatted payload  as list of objects
 * 
 * [
    {
      fields: {
        name: 'Vincent Test',
        email: 'cl8-test3@zmail.com',
      }
    }
  ]
 */
exports.addUsers = functions.https.onRequest((req, resp) => {
  cors(req, resp, async () => {
    // Check authentication
    try {
      if ((await checkAdmin(req, admin)) == false) {
        return resp.status(403).send('Only allowed for admin users')
      }
    } catch (err) {
      return resp.status(403).send(err.message)
    }

    // Wrap fields in object for CL8Importer
    const userlist = req.body.map(fields => ({ fields }))

    console.log('Creating new user', JSON.stringify(userlist[0], null, 2))

    const importer = Cl8Importer(admin)
    try {
      const importResults = await importer.addUsersAndTags(userlist)
      resp.send(importResults)
    } catch (err) {
      console.error(err)
      resp.status(400).send(err.message)
    }
  })
})
