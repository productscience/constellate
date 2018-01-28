const _ = require('lodash')
const debug = require('debug')('cl8.clearUsersAndDatabase')

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

async function clearFirebaseUserList () {
  debug('clearing the realtime database')
  // we don't use this later on, so we don't assign it to to a value
  await importer.fbase.admin
    .database()
    .ref('/')
    .set(null)
}

async function clearFirebaseAccounts () {
  debug('clearFirebaseAccounts: clearing firebase accounts')
  // clear any users in the test account
  const userAccountsToClear = await importer.fbase.getUsers()
  debug(`fetched ${userAccountsToClear.length} user accounts`)

  for (let account of userAccountsToClear) {
    debug('deleting account:', account.uid, account.email)

    try {
      await importer.fbase.admin.auth().deleteUser(account.uid)
    } catch (e) {
      debug(`error deleting account: ${account.uid}`)
      debug(e)
    }
  }
  debug('clearFirebaseAccounts: cleared firebase accounts')
}

// for this constellation:
// - remove all the user accounts
// - clear the realtime database

// debug('clearing accounts: starting')

// debug('clearing accounts: done')

// process.exit()
return new Promise(resolve => {
  debug('clearing accounts and data:')
  // return console.log(devBase, devKey, serviceAccount, databaseURL)
  debug('clearing data: starting')
  const accountResult = clearFirebaseAccounts()
  const databaseResult = clearFirebaseUserList()
  resolve([accountResult, databaseResult])
})
  .then(message => {
    debug('Deleted users and the firebase data')
    return process.exit()
  })
  .catch(err => {
    // we always want to show an error
    console.log(err)
    return process.exit()
  })
