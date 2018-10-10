const debug = require('debug')('cl8.makeUsersInvisible')
const _ = require('lodash')

const firebaseAdmin = require('firebase-admin')
const firebaseWrapper = require('../src/firebase-wrapper')(firebaseAdmin)

const devBase = process.env.AIRTABLE_BASE
const devKey = process.env.AIRTABLE_APIKEY

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const databaseURL = process.env.FIREBASE_DATABASEURL

// initialised it here instead of in functions
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

// for this constellation:
async function main() {
  let refs = await firebaseAdmin.database().ref('userlist')
    .orderByChild('fields/visible')
    .equalTo('yes')
  try {
    await refs.once('value', async refKey => {
      const pushKeys = _.keys(refKey.val())
      await pushKeys.forEach(async pk => {
        const newRef = await firebaseAdmin.database().ref(`userlist/${pk}`)
        await firebaseWrapper.makeVisible(newRef)
      })
    })
  } catch (e) {
    console.log(e)
  }
}

main()
