'use strict'

const setupFbaseAdmin = require('./src/config.js').default
const functions = require('firebase-functions')
const Cl8Importer = require('./src/importer.js')
const ProfileThumbnailer = require('./src/profile-thumbnailer.js')
const { checkAdmin } = require('./src/auth.js')
const cors = require('cors')({ origin: true })

const admin = setupFbaseAdmin()

// this function is used to generate a realistic objectMetaData for use in
// ./test/testFunction.js
// uncomment the folling lines to deploy it

// exports.generateSampleData = funsctions.storage
//   .object()
//   .onFinalize(function(_, object, context) {
//     console.log('data looks like this')
//     console.log('object', object)
//     return null
//   })

/**
 * Storage cloud function invoked on every new stored object that detects
 * uploaded pictures and generates a thumbnail for them
 *
 * For testing refer to https://stackoverflow.com/questions/47096736/how-to-test-firebase-triggers-locally-for-storage
 */
exports.generateThumbnail = functions.storage
  .object()
  .onFinalize(async function(_, object, context) {
    console.log('running func - generateThumbnail')
    const profThumb = ProfileThumbnailer(admin, object)

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
