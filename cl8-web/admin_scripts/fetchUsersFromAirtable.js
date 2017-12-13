const Airtable = require('airtable')
const base = new Airtable(
  {apiKey: process.env.AIRTABLE_API_KEY_DEV}).base(process.env.AIRTABLE_BASE_DEV)

const admin = require('firebase-admin')
const serviceAccount = require('../functions/service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

let ManagementClient = require('auth0').ManagementClient;
 // you get an auth0 token from
 // https://manage.auth0.com/#/apis/management/explorer
let auth0 = new ManagementClient({
  token: process.env.AUTH0_TOKEN,
  domain: process.env.AUTH0_DOMAIN
});

let fullTagList = []
let peepsList = []
let enrichedPeeps = []

base(process.env.AIRTABLE_TAG_NAME_DEV).select().all()
  .then(tags => {
    console.log('tags', tags.length)
    return addRecordtoList(tags, fullTagList)
  })
  .catch(err => { console.log(err) })
  .then(() => {
    base(process.env.AIRTABLE_PERSON_NAME_DEV).select().all()
  .then(peeps => {
    console.log('peeps', peeps.length)
    addRecordtoList(peeps, peepsList)
    return peepsList, fullTagList
  })
  .then(() => {
    console.log(peepsList.length, fullTagList.length)
    enrichedPeeps = peepsList.map(function(peep) {
      return enrichPeep(peep, fullTagList)
    })
    return enrichedPeeps
  }).then(enrichedPeeps => {
    console.log("time to write to firebase", enrichedPeeps.length)
    return admin.database().ref('userlist').set(enrichedPeeps)
  })
  .then(() => {
    console.log('Synchronization to Firebase succeeded')
    console.log(enrichedPeeps.length)
    return enrichedPeeps
  }).catch(error => {
    console.log('Synchronization to FireBase failed')
    console.log(error)
    process.exit()
  })
  .then(enrichedPeeps => {
    console.log(enrichedPeeps.length)
    let auth0Reqs = generateAuth0Promises(enrichedPeeps)
    return executeSequentally(auth0Reqs)
  }).then(values => {
    console.log(values)
    console.log('all finished')
    process.exit()
  }).catch(err => {
    console.log(err)
    process.exit()
  })
})

function generateAuth0Promises (users) {
  console.log('addUsersToAuth0', users.length)
  console.log('addUsersToAuth0', users[0])
  auth0Promises = []
  users.forEach(user => {
    let newUser = {
      "connection": "email",
      "email": user.fields.email,
      "email_verified": true,
      "verify_email": false,
    }
    // we need to define an function that returns the call to auth0.createUser
    // so we can execute it sequentially and not trigger the API limiting
    let auth0Promise = () => {
      return auth0.createUser(newUser)
      .then(user => {
        console.log('auth0 user', user.email)
        return user
      })
      .catch(err => {
        console.log(err)
      })
    }
    auth0Promises.push(auth0Promise)
  })
  return auth0Promises
}

function executeSequentally(promises) {
  var result = Promise.resolve()
  promises.forEach(function (promiseFactory) {
    result = result.then(promiseFactory);
  });
  return result
}

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

function enrichPeep (peep, tagsList) {
  enrichedTags = []
  function enrichTag (tagname) {
    return tagsList.filter(function(tag) {
      return tag.id === tagname
    })
  }
  if (typeof peep.fields.tags !== 'undefined'){
    peep.fields.tags = peep.fields.tags.map(function(peepTag) {
      let etag = enrichTag(peepTag)[0]
      return {
        'id': etag.id,
        'name': etag.fields.name
      }
    })
  }
  return peep
}
