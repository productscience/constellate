
const FireBaseWrapper = require('../functions/src/firebase-auth-wrapper.js')

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH_PROD)
const databaseURL = process.env.FIREBASE_DATABASEURL_PROD
const fbase = FireBaseWrapper(serviceAccount, databaseURL)
const fbAdmin = fbase.admin

const Airtable = require('airtable')
const base = new Airtable(
  // {apiKey: process.env.AIRTABLE_API_KEY_DEV}).base(process.env.AIRTABLE_BASE_DEV)
  {apiKey: process.env.AIRTABLE_API_KEY_PROD}).base(process.env.AIRTABLE_BASE_PROD)

let tagList = []

debugger

return base('tags').select().all()
  .then(tags => {
    addRecordtoList(tags, tagList)
    // return fbAdmin.database().ref('tags').set(tagList)
    //   .then(() => {
    //     console.log('Synchronization to Firebase succeeded')
    //     process.exit()
    // })
    console.log(tags.length)
  })
  .catch(err => {
    console.log(err)
    process.exit()
  })


function addRecordtoList (records, collection) {
  records.forEach(function (record) {
    firebaseRecord = {
      'id': record.id,
      'fields': record.fields,
      'createdTime': record._rawJson.createdTime
    }
    collection.push(firebaseRecord)
  })
  console.log(collection.length)

}
