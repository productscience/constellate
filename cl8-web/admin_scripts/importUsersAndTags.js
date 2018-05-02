const debug = require('debug')('cl8.importerUsersandTags')

const Cl8Importer = require('../functions/src/importer.js')

const firebaseAdmin = require('firebase-admin')

const devBase = process.env.AIRTABLE_BASE_DEV
const devKey = process.env.AIRTABLE_API_KEY_DEV

const serviceAccount = require('../functions/' +
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH_DEV)
const databaseURL = process.env.FIREBASE_DATABASEURL_DEV

// initialised it here instead of in functions
firebaseAdmin.initializeApp({
  serviceAccount: serviceAccount,
  databaseURL: databaseURL
})

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseApp: firebaseAdmin
}

const importer = Cl8Importer(importerCredentials)

async function main () {
  debug('Importing Users and Data:')
  await importer.importUsersAndTags()
  debug('Imported')
  return process.exit()
}

main()
