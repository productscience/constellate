const _ = require('lodash')

const Cl8Importer = require('../../functions/src/importer.js')
const AirTableWrapper = require('../../functions/src/airtable-wrapper.js')
const FireBaseAuthWrapper = require('../../functions/src/firebase-auth-wrapper.js')

const devBase = process.env.AIRTABLE_BASE_DEV
const devKey = process.env.AIRTABLE_API_KEY_DEV
const tagTable = process.env.AIRTABLE_TAG_NAME_DEV
const peepTable = process.env.AIRTABLE_PERSON_NAME_DEV

const serviceAccount = require('../' + process.env.FIREBASE_SERVICE_ACCOUNT_PATH_DEV
const databaseURL = process.env.FIREBASE_DATABASE_URL_DEV

const auth0Token = process.env.AUTH0_TOKEN
const auth0Domain = process.env.AUTH0_DOMAIN
const auth0clientId = process.env.AUTH0_CLIENT_ID

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: [serviceAccount, databaseURL],
  auth0Creds: [auth0Token, auth0Domain]
}
const importer = Cl8Importer(importerCredentials)


let fbUsers = importer.fbase.getUsers()


fbUsers.then(users => {
  // debugger
})
