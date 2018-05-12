'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Cl8Importer = require('./dist/importer.js');
const ProfileThumbnailer = require('./dist/profile-thumbnailer.js');
const CheckConfig = require('./dist/check-config.js');
let serviceAccount = require('./service-account.json');

// initialised it here instead of in functions
admin.initializeApp();

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

// this is only used to generate a realistic objectMetaData
exports.generateSampleData = functions.storage.object().onFinalize(object => {
  console.log('data looks like this');
  console.log(object);
});

exports.checkConfig = functions.storage.object().onFinalize(object => {
  // console.log(functions.config())
  return CheckConfig();
});

exports.generateThumbnail = functions.storage.object().onFinalize((() => {
  var _ref = _asyncToGenerator(function* (object) {
    console.log('running func - generateThumbnail');
    console.log('admin', admin);
    const profThumb = ProfileThumbnailer(admin, object);

    console.log('generateThumbnail', profThumb);

    const profileId = profThumb.isProfilePic(object);

    console.log('generateThumbnail profileId', profileId);

    if (profileId) {
      const res = yield profThumb.updateProfile(profileId, object);
      console.log('generateThumbnail res', res);
      console.log('profile pic thumbnails generated', res);
      return res;
    }

    console.log('not a profile pic');
    return false;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());

exports.importUsers = functions.https.onRequest((() => {
  var _ref2 = _asyncToGenerator(function* (request, response) {
    const importerCredentials = {
      airTableCreds: [functions.config().airtable.key, functions.config().airtable.base],
      fbaseApp: admin
    };

    const importer = Cl8Importer(importerCredentials);

    const importResults = yield importer.importUsersAndTags();
    response.send(importResults.length);
  });

  return function (_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})());
