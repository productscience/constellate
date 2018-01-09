const _ = require('lodash')
const fs = require('fs')
const debug = require('debug')('cl8-importer-test')

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

jest.setTimeout(10000)

// How would you test this? Is it worth it?
function executeSequentally (promises) {
  // accepts a list of promises, and executes them in order, appending
  // each promise to the chain until it's done
  var result = Promise.resolve()
  promises.forEach(function (promiseFactory) {
    result = result.then(promiseFactory)
  })
  return result
}



describe('helper functions', () => {
  let testUsers, testTags

  beforeEach(() => {
    testUsers = [{
      id: 'recXXXXXXXXXXXXXX',
      fields: {
        name: 'just a test user',
        email: 'totallynew@domain.com',
        website: 'newsite.com',
        tags: ['rec8AoQ0MPMJQxYKK', 'rec0E1cKWxINp13lg']
      }
    },
    {
      id: 'recXXXXXXXXXXXXXY',
      fields: {
        name: 'just another test user',
        email: 'bloke@anothersite.com',
        website: 'anothersite.com',
        tags: ['reclirD17BHglQHns']
      }
    }
    ]

    testTags = [{
      'id': 'rec8AoQ0MPMJQxYKK',
      'fields': {
        'name': 'Open Data'
      }
    },
    {
      'id': 'rec0E1cKWxINp13lg',
      'fields': {
        'name': 'Air Quality'
      }

    },
    {
      'id': 'reclirD17BHglQHns',
      'fields': {
        'name': 'Astrophysics'
      }
    }
    ]
  })

  test('enrichPeep', () => {
    let testUser = testUsers[0]
    expect.assertions(5)
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
      // debug(payload.peeps)
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
    let noStaleTestUsers = "{email} = 'importme@example.com'"
    return importer.atbl.fetchRecords('peeps', noStaleTestUsers)
      .then(peeps => {
        let killList = peeps.map(peep => {
          return () => {
            debug('nuking: ', peep.id)
            return importer.atbl.airtable('peeps').destroy(peep.id)
          }
        })
        return executeSequentally(killList)
      }).catch(err => {
        debug(err)
      })
      .then(() => {
        return importer.fbase.admin.database().ref('userlist').set(null)
      })
      .then(() => {
        // import tags and peeps
        return importer.atbl.getTags()
          .then(tags => {
            return importer.atbl.getUsers()
              .then(peeps => {
                debug('before: peeps.length: ', peeps.length)
                debug('before: tags.length: ', tags.length)
                payload.tags = tags
                payload.peeps = peeps
                return payload
              })
          })
        return payload
      })
      // set up our userList
      .then(payload => {
        let promiseList = payload.peeps.map(peep => {
          return () => {
            let userObj = {
              id: peep.id,
              fields: peep.fields
            }
            return importer.fbase.addUserToUserList(userObj)
          }
        })
        // now make sure our promise is resolved
        return executeSequentally(promiseList)
          .then(() => {
            return payload
          })
          .catch(err => {
            debug(err)
          })
      })
      .then(payload => {
        return importer.fbase.getUserList()
          .then(fbUserList => {
            payload.fbUserList = fbUserList
            return payload
          })
      })
  })

  test('filterOutPeepsToImport - none to import', () => {
    expect.assertions(3)
    // debug('payload.fbUserList', _.values(payload.fbUserList.val()))
    let enrichedPeeps = importer.buildEnrichedPeeps(payload.peeps, payload.tags)
    let usersToImport = importer.filterOutPeepsToImport(enrichedPeeps, payload.fbUserList)
    payload.fbUserList.val()

    return importer.fbase.getUserList().then(userList => {
      let userArray = _.values(userList.val())
      let payloadUserList = _.values(payload.fbUserList.val())
      expect(userArray.length).toBe(6)
      expect(payloadUserList.length).toBe(6)
      expect(usersToImport.length).toBe(0)
    })
  })

  test('filterOutPeepsToImport - one to import', () => {
    return importer.atbl.airtable(peepTable).create({
      'name': 'Person to import',
      'email': 'importme@example.com',
      'visible': 'yes',
      'admin': 'false'
    })
      .then(peep => {
        debug('created user: ', peep.id)
        tempPeep = peep
        payload.peepToImport = peep
        return payload
      })
      .then(payload => {
        return importer.atbl.getTags()
          .then(tags => {
            return importer.atbl.getUsers()
              .then(peeps => {
                payload.tags = tags
                payload.peeps = peeps
                return payload
              })
            expect.assertions(4)
            let enrichedPeeps = importer.buildEnrichedPeeps(payload.peeps, payload.tags)
            let usersToImport = importer.filterOutPeepsToImport(enrichedPeeps, payload.fbUserList)

            let userArray = _.values(userList.val())
            expect(userArray.length).toBe(6)

            expect(usersToImport.length).toBe(1)
            expect(usersToImport[0]).toHaveProperty('id')
            expect(usersToImport[0]).toHaveProperty('fields.email')
            expect(usersToImport[0]).toHaveProperty('fields.name')
          })
      })
  })

  afterEach(() => {
    if (typeof tempPeep !== 'undefined') {
      return importer.atbl.airtable(peepTable).destroy(tempPeep.id)
        .then(peep => {
          debug('destroyed: ', peep.id)
        }).catch(err => {
          debug(err)
        })
    }
  })
})

describe('importing users', () => {
  let payload = {}

  beforeEach(() => {
    let noStaleTestUsers = "{email} = 'importme@example.com'"
    let clearedTestUsers = importer.atbl.fetchRecords('peeps', noStaleTestUsers)
      .then(peeps => {
        debug(peeps.length + " peep to remove")
        let killList = peeps.map(peep => {
          return () => {
            debug('nuking: ', peep.fields.email)
            return importer.atbl.airtable('peeps').destroy(peep.id)
          }
        })
        return executeSequentally(killList)
      }).catch(err => {
        debug(err)
      })

    return clearedTestUsers.then(() => {
      let fetchTags = importer.atbl.getTags()
      let fetchPeeps = importer.atbl.getUsers()
        // set up our userList
      let clearedFBlistUsers = importer.fbase.admin.database().ref('userlist').set(null)

        return Promise.all([fetchTags, fetchPeeps, clearedFBlistUsers])
    })
    .then(results => {
        payload.tags = results[0]
        payload.peeps = results[1]
        debug("payload keys: ", _.keys(payload))
        debug("payload.peeps.length: ", payload.peeps.length)
        debug("payload.tags.length: ", payload.tags.length)


        // let enrichedPeeps = importer.buildEnrichedPeeps(payload.peeps, payload.tags)

        let promiseList = payload.peeps.map(peep => {
          return () => {

            let userObj = {
              id: peep.id,
              fields: peep.fields
            }
            debug("adding: ", userObj)
            return importer.fbase.addUserToUserList(userObj)
          }
        })


        return executeSequentally(promiseList)
      })
  })

  test('importUsersAcrossServices', () => {
    // add a new person to import
    return importer.atbl.airtable(peepTable).create({
      'name': 'Person to import',
      'email': 'importme@example.com',
      'visible': 'yes',
      'admin': 'false'
    })
    // return Promise.resolve()
    .then(peep => {
      debug('created user: ', peep.id)
      tempPeep = peep
      payload.peepToImport = peep
      return payload
    })
    // fetch the updated listof users and tags from airtable
    .then(payload => {
      let fetchedTags = importer.atbl.getTags()
      let fetchedUsers = importer.atbl.getUsers()

      return Promise.all([fetchedTags, fetchedUsers])
    })
    .then(results => {
      payload.tags = results[0]
      payload.peeps = results[1]
      return payload
    })
    // fetch the pre-importer data from auth0 and firebase
    .then(() => {
      let fetchedUserList = importer.fbase.getUserList()
      let fetchedFBUsers = importer.fbase.getUsers()
      let fetchedAuth0Users = importer.auth0.getUsers()
      return Promise.all([fetchedUserList, fetchedFBUsers, fetchedAuth0Users])
    })
    .then(results => {
      payload.fbUserList = results[0]
      payload.fbUsers = results[1]
      payload.auth0Users = results[2]
      return payload
    })
    // run the import command
    .then(() => {
      expect.assertions(6)
      expect(payload.peeps.length).toBe(7)
      expect(_.values(payload.fbUserList.val()).length).toBe(6)

      let enrichedPeeps = importer.buildEnrichedPeeps(payload.peeps, payload.tags)
      let usersToImport = importer.filterOutPeepsToImport(enrichedPeeps, payload.fbUserList)
      expect(usersToImport.length).toBe(1)
      return importer.importUsersAcrossServices(usersToImport)
    })
    // assert we see what we expected
    .then(results => {
      let fetchedUserList = importer.fbase.getUserList()
      let fetchedFBUsers = importer.fbase.getUsers()
      let fetchedAuth0Users = importer.auth0.getUsersByEmail('importme@example.com')
      return Promise.all([fetchedUserList, fetchedFBUsers, fetchedAuth0Users])
    })
    .then(results => {
      // check the new user is in the fbuserlist
      let lastaddedFBUserListUser = _.values(results[0].val()).slice(-1)[0]
      expect(lastaddedFBUserListUser).toHaveProperty('fields.email', 'importme@example.com')

      // check the new user is in the fb users too
      let fbusers = results[1].users.map(u => { return u.email })
      expect(fbusers).toContain('importme@example.com')

      // check the user is now in the auth0 list
      let auth0emails = results[2].map(u => { return u.email })
      expect(auth0emails).toContain('importme@example.com')

      // debugger
      // expect(2).toBe(3)
    })
  })

  afterEach(() => {
    if (typeof tempPeep !== 'undefined') {
      let peepToDelete = {
        id: tempPeep.id,
        fields: tempPeep.fields
      }
      return importer.fbase.deleteUser(peepToDelete)
    }
  })
})
