'use strict'

const path = require('path')
const debug = require('debug')('cl8.profile-thumbnailer')

const ThumbnailGenerator = require('./thumbnail-generator.js')
const _ = require('lodash')

module.exports = ProfileThumbnailer

/**

 *
 * @param {any} admin FirebaseAdmin
 * @param {any} profileId
 * @param {any} photoPath
 * @returns {Object}
 */
function ProfileThumbnailer(admin, objectMetaData) {
  /**
   * accepts a profile ID, and object representing a cloud file
   * fetches the file, and adds the thumbnails to the user's file
   *
   * @param {any} profileId
   * @param {any} objectMetaData
   * @returns
   */

  async function updateProfile(profileId) {
    const photoPath = objectMetaData.name

    const pushKey = await lookupProfile('id', profileId)
    const profile = await fetchProfile(pushKey)

    debug('prof', profile)
    const thumbgen = ThumbnailGenerator(admin, objectMetaData)
    debug('thumbgen', thumbgen)

    const photoUrls = await thumbgen.createThumbsForProfile(
      photoPath,
      'some-outfile.png'
    )
    debug('photoUrls', photoUrls)

    const savedProf = addPhotoUrls(profile, photoUrls)

    return savedProf
  }

  /**
   * Accepts a profileId, and finds the matching user. Returns a promise
   * which resolves to a snapshot
   *
   * @param {String} profileId
   * @returns {Promise} Snapshot
   */
  function fetchProfile(firebaseKey) {
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
  function lookupProfile(lookupKey, lookupValue) {
    debug('looking key: ', lookupKey, ' - with value:', lookupValue)
    return admin
      .database()
      .ref('userlist')
      .orderByChild(lookupKey)
      .equalTo(lookupValue)
      .limitToFirst(1)
      .once('value')
      .then(snap => {
        const firebaseKey = _.keys(snap.val())[0]
        debug('found firebaseKey:', firebaseKey)
        return firebaseKey
      })
  }

  /**
   * Accepts a metadata object representing an uploaded file
   * if the filename matches a known pattern for an Id we're using,
   * it returns the profileID
   *
   * @param {MetaDataObject} fileObjectMetaData
   * @returns {string} profileId
   */
  function isProfilePic(fileObjectMetaData) {
    if (fileObjectMetaData == null) return false

    const filePath = fileObjectMetaData.name
    const fileName = path.basename(filePath)

    const splitName = fileName.split('-')

    if (splitName.length === 0) return false

    debug('isProfilePic.splitName', splitName)
    const maybeProfileId = splitName[0]

    // first part of object begins with rec,
    // and is as long as a typical airtable ID
    if (
      (maybeProfileId.match(/rec/) && maybeProfileId.length === 17) ||
      maybeProfileId.length >= 28
    ) {
      return maybeProfileId
    }

    return false
  }

  /**
   * Accept a profile, and update the
   *
   * @param {any} profile
   * @returns  {Promise} containing void
   *
   */
  async function addPhotoUrls(profile, photoObject) {
    debug('addPhotoUrls')
    debug('addPhotoUrls:profile', profile)

    const newPhotoObj = _.merge(profile.val().fields.photo, photoObject)
    let profileVal = profile.val()
    profileVal.fields.photo = newPhotoObj

    debug('addPhotoUrls:profile - after', profileVal)

    // we use set to overwrite the profile with the updated object
    await profile.ref.set(profileVal)

    return newPhotoObj
  }

  return {
    isProfilePic,
    updateProfile,
    lookupProfile,
    fetchProfile,
    addPhotoUrls
  }
}
