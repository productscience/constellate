const _ = require('lodash')
const debug = require('debug')('cl8.importerUsersandTags')

const Cl8Importer = require('../functions/src/importer.js')

const devBase = process.env.AIRTABLE_BASE_DEV
const devKey = process.env.AIRTABLE_API_KEY_DEV

const serviceAccount = require('../functions/' +
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH_DEV)
const databaseURL = process.env.FIREBASE_DATABASEURL_DEV

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: [serviceAccount, databaseURL]
}

const importer = Cl8Importer(importerCredentials)

return new Promise(resolve => {
  debug('Importing Users and Data:')
  const importResults = importer.importUsersAndTags()
  resolve(importResults)
})
  .then(message => {
    debug('Imported')
    return process.exit()
  })
  .catch(err => {
    // we always want to show an error
    console.log(err)
    return process.exit()
  })
