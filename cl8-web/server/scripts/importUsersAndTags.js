const debug = require('debug')('cl8.importerUsersandTags')

const Cl8Importer = require('../src/importer.js')

const firebaseAdmin = require('firebase-admin')

const devBase = process.env.AIRTABLE_BASE
const devKey = process.env.AIRTABLE_APIKEY

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const databaseURL = process.env.FIREBASE_DATABASEURL

// initialised it here instead of in functions
firebaseAdmin.initializeApp({
  serviceAccount: serviceAccount,
  databaseURL: databaseURL
})

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: firebaseAdmin
}

const importer = Cl8Importer(importerCredentials)

async function main() {
  debug('Importing Users and Data:')
  await importer.importUsersAndTags()
  debug('Imported')
  return process.exit()
}

main()
