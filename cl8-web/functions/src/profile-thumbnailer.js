const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
const admin = require('firebase-admin')

const debug = require('debug')('cl8.profiler-thumbnailer')
module.exports = ProfileThumbnailer

/**
 *  accepts a profile ID, and object representing a cloud file
 * fetches the file, and adds the thumbnails to the user's file
 *
 * @param {any} config
 * @param {any} profileId
 * @param {any} photoPath
 * @returns {Object}
 */
function ProfileThumbnailer (config, profileId, photoPath) {
  admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount),
    databaseURL: config.databaseURL
  })

  function updateProfile (profileId, photoPath) {
    // const prof = await fetchProfile(profileId)

    // const thumbnailUrls = generateThumbs(photoPath)

    // savedProf = addPhotoUrls(prof)

    return true
  }

  function fetchProfile (profileId) {
    return admin
      .database()
      .ref('userlist')
      .orderByChild('id')
      .equalTo(profileId)
      .once('value', person => {})
  }

  return {
    updateProfile,
    fetchProfile
  }
}
