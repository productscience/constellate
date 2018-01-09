const Airtable = require('airtable')
const FireBaseWrapper = require('../functions/src/firebase-auth-wrapper.js')
const Auth0Wrapper = require('../functions/src/auth0-wrapper.js')

const tagsName = process.env.AIRTABLE_TAG_NAME_PROD
const personName = process.env.AIRTABLE_PERSON_NAME_PROD
const apiKey = process.env.AIRTABLE_API_KEY_PROD
const baseName = process.env.AIRTABLE_BASE_PROD


// check when reusing values set for webpack
// webpack's double quotes mean auth0 complains if you use them without
// converting them
const auth0Domain = process.env.AUTH0_DOMAIN
const auth0Token = process.env.AUTH0_TOKEN

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH_PROD)
const databaseURL = process.env.FIREBASE_DATABASE_URL

const base = new Airtable({apiKey: apiKey}).base(baseName)


const fbase = FireBaseWrapper(serviceAccount, databaseURL)
const fbAdmin = fbase.admin

const auth0Wrapper = Auth0Wrapper(auth0Token, auth0Domain)
const auth0 = auth0Wrapper.auth0

let fullTagList = []
let peepsList = []
let enrichedPeeps = []

base(tagsName).select().all()
  .then(tags => {
    console.log('tags', tags.length)
    return addRecordtoList(tags, fullTagList)
  })
  .then(() => {
    base(personName).select({filterByFormula: "NOT({email} = '')"}).all()
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
  })
  // THIS CURRENTLY WIPES FIREBASE's DATA
  // WE WANT TO ONLY ADD NEW USERS
  .then(enrichedPeeps => {
    // console.log(enrichedPeeps)
    console.log("time to write to firebase", enrichedPeeps.length)
    return fbAdmin.database().ref('userlist').set(enrichedPeeps)
  })
  .then(() => {
    console.log('Synchronization to Firebase succeeded')
    console.log(enrichedPeeps.length)
    return enrichedPeeps
  }).catch(err => {
    console.log('problems syncing to firebase')
    console.log(err)
  })

  .then(enrichedPeeps => {
    let firebaseAuthReqs = generateFireBaseAuthPromises(enrichedPeeps)
    return executeSequentally(firebaseAuthReqs)
  })
  .then(() => {
    console.log(enrichedPeeps.length)
    let auth0Reqs = generateAuth0Promises(enrichedPeeps)
    return executeSequentally(auth0Reqs)
  })
  // we need to add the firebase ids in now
  .then(() => {
    let auth0Reqs = generatFireBaseAirTableIdPromises(enrichedPeeps)
    return executeSequentally(auth0Reqs)
  })
  //
  .then(() => {
    console.log('all finished')
    process.exit()
  }).catch(err => {
    console.log(err)
    process.exit()
  })
})

function generatFireBaseAirTableIdPromises (users) {
  return users.map(user => {
    return () => {
      let email = user.fields.email,
      params = { firebaseId: user.id }
      return auth0Wrapper.addAirtableAPIToUserByEmail(user.fields.email, params)
    }
  })
}


function generateFireBaseAuthPromises (users) {
  return users.map(user => {
    return () => {
      // let u = { uid: user.id, email: user.fields.email }
      return fbase.getOrCreateUser(user, fbAdmin)
    }
  })
}

function generateAuth0Promises (users) {
  console.log('addUsersToAuth0', users.length)
  console.log('addUsersToAuth0', users[0])
  auth0Promises = []
  users.forEach(user => {
    // we need to define an function that returns the call to auth0.createUser
    // so we can execute it sequentially and not trigger the API limiting
    let auth0Promise = () => {
      return auth0Wrapper.getOrCreateUser(user.fields.email)
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
