const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
const debug = require('debug')('cl8.profiler-thumbnailer')

const ThumbnailGenerator = require('./thumbnail-generator.js')

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
    debug('addPhotoUrls')
    debug('addPhotoUrls:profile', profile.val())
    const photos = await profile.child('fields/photo')

    debug('addPhotoUrls:profile.fields.photo', profile.val().fields.photo)
    debug('addPhotoUrls:photos', photos.val())

    const newPhotoObj = _.merge(profile.val().fields.photo, photoObject)

    // we use set to overritw the array of photos, as we're not tracking previous ones
    await photos.ref.set(newPhotoObj)

    return newPhotoObj
  }

  return {
    updateProfile,
    lookupProfile,
    fetchProfile,
    addPhotoUrls
  }
}
