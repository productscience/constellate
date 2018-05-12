'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const debug = require('debug')('cl8.profile-thumbnailer');

const ThumbnailGenerator = require('./thumbnail-generator.js');
const _ = require('lodash');

module.exports = ProfileThumbnailer;

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

  let updateProfile = (() => {
    var _ref = _asyncToGenerator(function* (profileId) {
      const photoPath = objectMetaData.name;

      const pushKey = yield lookupProfile('id', profileId);
      const profile = fetchProfile(pushKey);

      debug('prof', profile);
      const thumbgen = ThumbnailGenerator(admin, objectMetaData);
      debug('thumbgen', thumbgen);

      const photoUrls = yield thumbgen.createThumbsForProfile(photoPath, 'some-outfile.png');
      debug('photoUrls', photoUrls);

      const savedProf = addPhotoUrls(profile, photoUrls);

      return savedProf;
    });

    return function updateProfile(_x) {
      return _ref.apply(this, arguments);
    };
  })();

  /**
   * Accepts a profileId, and finds the matching user. Returns a promise
   * which resolves to a snapshot
   *
   * @param {String} profileId
   * @returns {Promise} Snapshot
   */


  /**
   * Accept a profile, and update the
   *
   * @param {any} profile
   * @returns  {Promise} containing void
   *
   */
  let addPhotoUrls = (() => {
    var _ref2 = _asyncToGenerator(function* (profile, photoObject) {
      debug('addPhotoUrls');
      debug('addPhotoUrls:profile', profile.val());

      const newPhotoObj = _.merge(profile.val().fields.photo, photoObject);
      let profileVal = profile.val();
      profileVal.fields.photo = newPhotoObj;

      debug('addPhotoUrls:profile - after', profileVal);

      // we use set to overwrite the profile with the updated object
      yield profile.ref.set(profileVal);

      return newPhotoObj;
    });

    return function addPhotoUrls(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  })();

  function fetchProfile(firebaseKey) {
    return admin.database().ref('userlist').child(firebaseKey).once('value').then(snap => snap);
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
    debug('looking key: ', lookupKey, ' - with value:', lookupValue);
    return admin.database().ref('userlist').orderByChild(lookupKey).equalTo(lookupValue).limitToFirst(1).once('value').then(snap => {
      const firebaseKey = _.keys(snap.val())[0];
      debug('found firebaseKey:', firebaseKey);
      return firebaseKey;
    });
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
    const filePath = objectMetaData.name;
    const fileName = path.basename(filePath);

    const splitName = fileName.split('-');

    if (splitName.length === 0) return false;

    debug('isProfilePic.splitName', splitName);
    const maybeProfileId = splitName[0];

    // first part of object begins with rec,
    // and is as long as a typical airtable ID
    if (maybeProfileId.match(/rec/) && maybeProfileId.length === 17) {
      return maybeProfileId;
    }

    return false;
  }

  return {
    isProfilePic,
    updateProfile,
    lookupProfile,
    fetchProfile,
    addPhotoUrls
  };
}