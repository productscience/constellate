const prompt = require('prompt')
const debug = require('debug')('cl8.clearUsersAndDatabase')

const Cl8Importer = require('../src/importer.js')

const devBase = process.env.AIRTABLE_BASE
const devKey = process.env.AIRTABLE_APIKEY

const serviceAccount = require('../' +
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
const databaseURL = process.env.FIREBASE_DATABASEURL

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: [serviceAccount, databaseURL]
}

const importer = Cl8Importer(importerCredentials)

async function clearFirebaseUserList() {
  debug('clearing the realtime database')
  // we don't use this later on, so we don't assign it to to a value
  await importer.fbase.admin
    .database()
    .ref('/')
    .set(null)
}

async function clearFirebaseAccounts() {
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
async function main() {
  console.log('This will clear the database at', databaseURL)
  console.log('Are you sure you want this?')
  const domainToCheck = databaseURL.split('.')[0].replace('https://', '')

  console.log('if so, add type in the name of this database:', domainToCheck)

  prompt.start()

  prompt.get('confirmation', async function(err, result) {
    if (err) {
      throw err
    }

    console.log('checking: ', domainToCheck, result.confirmation)

    if (result.confirmation !== domainToCheck) {
      console.log("This response doesn't match. Exiting early")
      process.exit("exiting early a they don't match")
    }

    console.log('clearing accounts and data:')
    // - remove all the user accounts

    await clearFirebaseAccounts()

    // - clear the realtime database
    await clearFirebaseUserList()

    console.log('The deed is done.')
    process.exit()
  })
}

main()
