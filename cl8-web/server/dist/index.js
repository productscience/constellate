'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const functions = require('firebase-functions');
const Cl8Importer = require('./importer.js');

const serviceAccount = require(functions.config().fbase.path);

const importerCredentials = {
  airTableCreds: [functions.config().airtable.Key, functions.config().airtable.KeyBase],
  fbaseCreds: [serviceAccount, functions.config().firebase.databaseURL]
};

const importer = Cl8Importer(importerCredentials);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// just a check so you can run it in `firebase experimental:functions:shell`
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});

exports.importUsers = functions.https.onRequest((() => {
  var _ref = _asyncToGenerator(function* (request, response) {
    const importResults = yield importer.importUsersAndTags();
    response.send(importResults);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})());