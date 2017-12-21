const _ = require('lodash')
const fs = require('fs')
const debug = require('debug')('importer.test')


const Cl8Importer = require('../../functions/src/importer.js')
const AirTableWrapper = require('../../functions/src/airtable-wrapper.js')
const FireBaseAuthWrapper = require('../../functions/src/firebase-auth-wrapper.js')

const devBase = process.env.AIRTABLE_BASE_TEST
const devKey = process.env.AIRTABLE_API_KEY_TEST
const tagTable = process.env.AIRTABLE_TAG_NAME_TEST
const peepTable = process.env.AIRTABLE_PERSON_NAME_TEST

const serviceAccount = require('../' + process.env.FIREBASE_SERVICE_ACCOUNT_PATH_TEST)
const databaseURL = process.env.FIREBASE_DATABASE_URL_TEST

const auth0Token = process.env.AUTH0_TOKEN_TEST
const auth0Domain = process.env.AUTH0_DOMAIN_TEST

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: [serviceAccount, databaseURL],
  auth0Creds: [auth0Token, auth0Domain]
}
const importer = Cl8Importer(importerCredentials)
let preWork, tempPeep

// How would you test this? Is it worth it?
function executeSequentally(promises) {
  // accepts a list of promises, and executes them in order, appending
  // each promise to the chain until it's done
  var result = Promise.resolve()
  promises.forEach(function(promiseFactory) {
    result = result.then(promiseFactory);
  });
  return result
}

describe('helper functions', () => {

  let testUsers, testTags

  beforeEach(() => {

    testUsers = [{
        id: 'recXXXXXXXXXXXXXX',
        fields: {
          name: "just a test user",
          email: 'totallynew@domain.com',
          website: "newsite.com",
          tags: ['rec8AoQ0MPMJQxYKK', 'rec0E1cKWxINp13lg']
        },
      },
      {
        id: 'recXXXXXXXXXXXXXY',
        fields: {
          name: "just another test user",
          email: 'bloke@anothersite.com',
          website: "anothersite.com",
          tags: ['reclirD17BHglQHns']
        }
      }
    ]

    testTags = [{
        "id": "rec8AoQ0MPMJQxYKK",
        "fields": {
          "name": "Open Data"
        }
      },
      {
        "id": "rec0E1cKWxINp13lg",
        "fields": {
          "name": "Air Quality"
        }

      },
      {
        "id": "reclirD17BHglQHns",
        "fields": {
          "name": "Astrophysics"
        }
      }
    ]

  })

  test('enrichPeep', () => {

    let testUser = testUsers[0]
    expect.assertions(5);
    let enrichedPeep = importer.enrichPeep(testUser, testTags)
    let firstTag = enrichedPeep.fields.tags[0]
    let secondTag = enrichedPeep.fields.tags[1]
    expect(enrichedPeep.fields.tags.length).toBe(2)
    expect(firstTag).toHaveProperty('id', 'rec8AoQ0MPMJQxYKK')
    expect(firstTag).toHaveProperty('name', 'Open Data')
    expect(secondTag).toHaveProperty('id', 'rec0E1cKWxINp13lg')
    expect(secondTag).toHaveProperty('name', 'Air Quality')
  })

  test('buildEnrichedPeeps', () => {
    let enrichedPeeps = importer.buildEnrichedPeeps(testUsers, testTags)
    let tag = enrichedPeeps[0].fields.tags[0]
    expect(enrichedPeeps.length).toBe(2)
    expect(tag).toHaveProperty('id', 'rec8AoQ0MPMJQxYKK')
    expect(tag).toHaveProperty('name', 'Open Data')
  })
})


describe('3rd party API functions', () => {
  test('fetchAllDataforSyncing', () => {
    // this is a method takes ages as it's doing lots of work. Might
    // be worth mocking it, or
    return importer.fetchAllDataforSyncing().then(payload => {
      // debugger
      // console.log(payload.peeps)
      // var fs = require('fs');

      expect(payload).toHaveProperty('auth0users')
      expect(payload).toHaveProperty('peeps')
      expect(payload).toHaveProperty('tags')
      expect(payload).toHaveProperty('fbUsers')
      expect(payload).toHaveProperty('fbUserList')
    })
    // 10000 is for a longer to timeout as we're waiting for
    // loads of API calls to return
  }, 10000)
})

describe('finding new users to import', () => {

  let payload = {}

  beforeEach(() => {

    // import tags and peeps
    return importer.atbl.getTags()
      .then(tags => {
        return importer.atbl.getUsers()
          .then(peeps => {
            debug(peeps.length)
            debug(tags.length)
            payload.tags = tags
            payload.peeps = peeps
            return payload
          })
      })
    // set up our userList
    .then(payload => {
      let promiseList = payload.peeps.map(peep => {
        return importer.fbase.addUserToUserList(peep)
      })

      return executeSequentally(promiseList)
        .then(() => {
          return payload
        })
        .catch(err => {
          console.log(err)
        })
    })
    .then(payload => {
      return importer.fbase.getUserList()
        .then(fbUserList => {
          // debugger
          payload.fbUserList = fbUserList
          return payload
        })
        return payload
    })
    .then(payload => {
      return importer.atbl.airtable(peepTable).create({
          "name": "Person to import",
          "tags": [],
          "email": "importme@example.com",
          "visible": "yes",
          "admin": "false"
        })
        .then(peep => {
          debug('created user: ', peep.id)
          tempPeep = peep
          payload.peepToImport = peep
          return payload
        })
    })
    .then(payload => {
      return importer.atbl.getTags()
        .then(tags => {
          return importer.atbl.getUsers()
            .then(peeps => {
              debug(peeps.length)
              debug(tags.length)
              payload.tags = tags
              payload.peeps = peeps
              return payload
            })
        })
    })
  })

  test('filterOutPeepsToImport', () => {
    expect.assertions(1);
    // debugger
    let enrichedPeeps = importer.buildEnrichedPeeps(payload.peeps, payload.tags)
    let usersToImport = importer.filterOutPeepsToImport(enrichedPeeps, payload.fbUserList)
    expect(usersToImport.length).toBe(1)
  }, 16000)

  afterEach(() => {
    return importer.atbl.airtable(peepTable).destroy(tempPeep.id)
      .then(peep => {
        console.log("destroyed: ", peep.id)
      }).catch(err => {
        console.log(err)
      })
  })

})
