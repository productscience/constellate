const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
const debug = require('debug')('cl8.profiler-thumbnailer')

const _ = require('lodash')
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
function ProfileThumbnailer (admin, profileId, photoPath) {
  function updateProfile (profileId, photoPath) {
    // const prof = await fetchProfile(profileId)

    // const thumbnailUrls = generateThumbs(photoPath)

    // savedProf = addPhotoUrls(prof)

    return true
  }

  /**
   * Accepts a profileId, and finds the matching user. Returns a promise
   * which resolves to a snapshot
   *
   * @param {String} profileId
   * @returns {Promise} Snapshot
   */
  function fetchProfile (firebaseKey) {
    return admin
      .database()
      .ref('userlist')
      .child(firebaseKey)
      .once('value')
      .then(snap => snap)
  }

  /**
   * Accepts a key to for a matchin a user list, long with the value,
   * and returns the first matching key to use with fetchProfile()
   *
   * @param {String} lookupKey
   * @param {String} lookupValue
   * @returns {String} firebaseKey
   */
  function lookupProfile (lookupKey, lookupValue) {
    debug('looking key: ', lookupKey, ' - with value:', lookupValue)
    return admin
      .database()
      .ref('userlist')
      .orderByChild(lookupKey)
      .equalTo(lookupValue)
      .limitToFirst(1)
      .once('value')
      .then(snap => {
        return _.keys(snap.val())[0]
      })
  }
  /**
   * Accept a profile, and update the
   *
   * @param {any} profile
   * @returns  {Promise} containing void
   *
   */
  async function addPhotoUrls (profile, photoObject) {
    // debug(profile)
    const photos = await profile.child('photo')

    // debug('photos ref', photos.ref)
    const updatedPhotos = await photos.ref.set(photoObject)

    return updatedPhotos
  }

  return {
    updateProfile,
    lookupProfile,
    fetchProfile,
    addPhotoUrls
  }
}
