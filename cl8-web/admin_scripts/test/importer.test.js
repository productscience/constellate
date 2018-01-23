const _ = require('lodash')
const debug = require('debug')('cl8.importer.test')

const Cl8Importer = require('../../functions/src/importer.js')

const devBase = process.env.AIRTABLE_BASE_TEST
const devKey = process.env.AIRTABLE_API_KEY_TEST
const tagTable = process.env.AIRTABLE_TAG_NAME_TEST
const peepTable = process.env.AIRTABLE_PERSON_NAME_TEST

const serviceAccount = require('../' +
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH_TEST)
const databaseURL = process.env.FIREBASE_DATABASE_URL_TEST

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: [serviceAccount, databaseURL]
}

const importer = Cl8Importer(importerCredentials)

jest.setTimeout(10000)

describe('helper functions', () => {
  let testUsers, testTags

  beforeEach(() => {
    testUsers = [
      {
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

    testTags = [
      {
        id: 'rec8AoQ0MPMJQxYKK',
        fields: {
          name: 'Open Data'
        }
      },
      {
        id: 'rec0E1cKWxINp13lg',
        fields: {
          name: 'Air Quality'
        }
      },
      {
        id: 'reclirD17BHglQHns',
        fields: {
          name: 'Astrophysics'
        }
      }
    ]
  })

  test('enrichPeep', () => {
    let testUser = testUsers[0]
    expect.assertions(5)
    let enrichedPeep = importer.enrichPeep(testUser, testTags)
    expect(enrichedPeep.fields.tags.length).toBe(2)

    let firstTag = enrichedPeep.fields.tags[0]
    let secondTag = enrichedPeep.fields.tags[1]
    expect(firstTag).toHaveProperty('id', 'rec8AoQ0MPMJQxYKK')
    expect(firstTag).toHaveProperty('name', 'Open Data')
    expect(secondTag).toHaveProperty('id', 'rec0E1cKWxINp13lg')
    expect(secondTag).toHaveProperty('name', 'Air Quality')
  })

  test('buildEnrichedPeeps', () => {
    let enrichedPeeps = importer.buildEnrichedPeeps(testUsers, testTags)
    expect(enrichedPeeps.length).toBe(2)

    let tag = enrichedPeeps[0].fields.tags[0]
    expect(tag).toHaveProperty('id', 'rec8AoQ0MPMJQxYKK')
    expect(tag).toHaveProperty('name', 'Open Data')
  })
})

describe('3rd party API functions', () => {
  test(
    'fetchAllDataforSyncing',
    async () => {
      // TODO this is a method takes ages as it's doing lots of work.
      // We should look at mocking it.
      const payload = await importer.fetchAllDataforSyncing()

      expect(payload).toHaveProperty('peeps')
      expect(payload).toHaveProperty('tags')
      expect(payload).toHaveProperty('fbUsers')
      expect(payload).toHaveProperty('fbUserList')
      // 10000 is for a longer to timeout as we're waiting for
      // loads of API calls to return
    },
    10000
  )
})

describe.only('finding new users to import', () => {
  let payload = {}

  async function clearAirtable () {
    debug('clearAirtable: clearing airtable')
    const noStaleTestUsers = "{email} = 'importme@example.com'"
    const usersToNuke = await importer.atbl.fetchRecords(
      'peeps',
      noStaleTestUsers
    )

    await usersToNuke.forEach(async peep => {
      debug('deleting peep from airtable: ', peep.id)
      try {
        const nukedUser = await importer.atbl.airtable('peeps').destroy(peep.id)
        debug('deleted airtable peep: ', nukedUser.id)
      } catch (e) {
        debug('problem nuking user from airtable:', peep.id)
        debug(e)
      }
    })
    debug('clearAirtable: cleared airtable')
  }

  async function clearFirebaseAccounts () {
    debug('clearFirebaseAccounts: clearing firebase accounts')
    // clear any users in the test account
    const userAccountsToClear = await importer.fbase.getUsers()
    debug(`fetched ${userAccountsToClear.length} user accounts`)
    userAccountsToClear.forEach(async account => {
      debug('deleting', account)
      try {
        await importer.fbase.admin.deleteUser(account.uid)
      } catch (e) {
        debug(`error deleting account: ${account.uid}`)
        debug(e)
      }
    })
    debug('clearFirebaseAccounts: cleared firebase accounts')
  }

  async function addPeepsToFireBaseUserList (peeps, tags) {
    debug('addPeepsToFireBaseUserList: add to userlist')
    const initialUserList = await importer.fbase.getUserList()

    await peeps.forEach(async peep => {
      const userObj = { id: peep.id, fields: peep.fields }
      const resp = await importer.fbase.addUserToUserList(
        userObj,
        initialUserList
      )
      debug('addUser result:', resp.found, resp.user.id)
    })
    debug('addPeepsToFireBaseUserList: added to userlist')
  }

  beforeEach(async () => {
    await clearAirtable()
    await clearFirebaseAccounts()

    // we don't use this later on, so we don't assign it to to a value
    await importer.fbase.admin
      .database()
      .ref('userlist')
      .set(null)

    const tags = await importer.atbl.getTags()
    const peeps = await importer.atbl.getUsers()

    debug('before: peeps.length: ', peeps.length)
    debug('before: tags.length: ', tags.length)

    await addPeepsToFireBaseUserList(peeps, tags)

    // fetch the up to date list of users
    const fbaseUserList = await importer.fbase.getUserList()

    payload.peeps = peeps
    payload.tags = tags
    payload.fbUserList = fbaseUserList
  }, 15000)

  test(
    'filterOutPeepsToImport - none to import',
    async () => {
      const enrichedPeeps = importer.buildEnrichedPeeps(
        payload.peeps,
        payload.tags
      )
      const usersToImport = importer.filterOutPeepsToImport(
        enrichedPeeps,
        payload.fbUserList
      )
      expect(enrichedPeeps.length).toBe(6)
      expect(payload.fbUserList.length).toBe(6)
      expect(usersToImport.length).toBe(0)
    },
    15000
  )

  test.only('filterOutPeepsToImport - one to import', async () => {
    const newAirtableUserPayload = {
      name: 'Person to import',
      email: 'importme@example.com',
      visible: 'yes',
      admin: 'false',
      tags: []
    }

    const newAirtableUser = await importer.atbl
      .airtable(peepTable)
      .create(newAirtableUserPayload)

    const updatedPeeps = await importer.atbl.getUsers()
    const updatedTags = await importer.atbl.getTags()

    const enrichedPeeps = importer.buildEnrichedPeeps(updatedPeeps, updatedTags)

    const usersToImport = importer.filterOutPeepsToImport(
      enrichedPeeps,
      payload.fbUserList
    )

    // test we have the right number of people to import
    expect(usersToImport.length).toBe(1)

    // test the user has the structure we expect it to
    const importUser = usersToImport[0]
    expect(importUser).toHaveProperty('id')
    expect(importUser.id).toEqual(newAirtableUser.id)

    // test imported users have the properties we expect

    expect(importUser).toHaveProperty('fields.email')
    expect(importUser.fields.email).toEqual(newAirtableUser.fields.email)
    expect(importUser).toHaveProperty('fields.name')
    expect(importUser.fields.name).toEqual(newAirtableUser.fields.name)
  })

  afterEach(() => {})
})

// describe('importing users', () => {
//   let payload = {}

//   beforeEach(() => {
//     let noStaleTestUsers = "{email} = 'importme@example.com'"
//     let clearedTestUsers = importer.atbl
//       .fetchRecords('peeps', noStaleTestUsers)
//       .then(peeps => {
//         debug(peeps.length + ' peep to remove')
//         let killList = peeps.map(peep => {
//           return () => {
//             debug('nuking: ', peep.fields.email)
//             return importer.atbl.airtable('peeps').destroy(peep.id)
//           }
//         })
//         return executeSequentally(killList)
//       })
//       .catch(err => {
//         debug(err)
//       })

//     return clearedTestUsers
//       .then(() => {
//         let fetchTags = importer.atbl.getTags()
//         let fetchPeeps = importer.atbl.getUsers()
//         // set up our userList
//         let clearedFBlistUsers = importer.fbase.admin
//           .database()
//           .ref('userlist')
//           .set(null)

//         return Promise.all([fetchTags, fetchPeeps, clearedFBlistUsers])
//       })
//       .then(results => {
//         payload.tags = results[0]
//         payload.peeps = results[1]
//         debug('payload keys: ', _.keys(payload))
//         debug('payload.peeps.length: ', payload.peeps.length)
//         debug('payload.tags.length: ', payload.tags.length)

//         // let enrichedPeeps = importer.buildEnrichedPeeps(payload.peeps, payload.tags)

//         let promiseList = payload.peeps.map(peep => {
//           return () => {
//             let userObj = {
//               id: peep.id,
//               fields: peep.fields
//             }
//             debug('adding: ', userObj)
//             return importer.fbase.addUserToUserList(userObj)
//           }
//         })

//         return executeSequentally(promiseList)
//       })
//   })

//   test('importUsersAcrossServices', () => {
//     // add a new person to import
//     return (
//       importer.atbl
//         .airtable(peepTable)
//         .create({
//           name: 'Person to import',
//           email: 'importme@example.com',
//           visible: 'yes',
//           admin: 'false'
//         })
//         // return Promise.resolve()
//         .then(peep => {
//           debug('created user: ', peep.id)
//           tempPeep = peep
//           payload.peepToImport = peep
//           return payload
//         })
//         // fetch the updated listof users and tags from airtable
//         .then(payload => {
//           let fetchedTags = importer.atbl.getTags()
//           let fetchedUsers = importer.atbl.getUsers()

//           return Promise.all([fetchedTags, fetchedUsers])
//         })
//         .then(results => {
//           payload.tags = results[0]
//           payload.peeps = results[1]
//           return payload
//         })
//         // fetch the pre-importer data from auth0 and firebase
//         .then(() => {
//           let fetchedUserList = importer.fbase.getUserList()
//           let fetchedFBUsers = importer.fbase.getUsers()
//           let fetchedAuth0Users = importer.auth0.getUsers()
//           return Promise.all([
//             fetchedUserList,
//             fetchedFBUsers,
//             fetchedAuth0Users
//           ])
//         })
//         .then(results => {
//           payload.fbUserList = results[0]
//           payload.fbUsers = results[1]
//           payload.auth0Users = results[2]
//           return payload
//         })
//         // run the import command
//         .then(() => {
//           expect.assertions(6)
//           expect(payload.peeps.length).toBe(7)
//           expect(_.values(payload.fbUserList.val()).length).toBe(6)

//           let enrichedPeeps = importer.buildEnrichedPeeps(
//             payload.peeps,
//             payload.tags
//           )
//           let usersToImport = importer.filterOutPeepsToImport(
//             enrichedPeeps,
//             payload.fbUserList
//           )
//           expect(usersToImport.length).toBe(1)
//           return importer.importUsersAcrossServices(usersToImport)
//         })
//         // assert we see what we expected
//         .then(results => {
//           let fetchedUserList = importer.fbase.getUserList()
//           let fetchedFBUsers = importer.fbase.getUsers()
//           let fetchedAuth0Users = importer.auth0.getUsersByEmail(
//             'importme@example.com'
//           )
//           return Promise.all([
//             fetchedUserList,
//             fetchedFBUsers,
//             fetchedAuth0Users
//           ])
//         })
//         .then(results => {
//           // check the new user is in the fbuserlist
//           let lastaddedFBUserListUser = _.values(results[0].val()).slice(-1)[0]
//           expect(lastaddedFBUserListUser).toHaveProperty(
//             'fields.email',
//             'importme@example.com'
//           )

//           // check the new user is in the fb users too
//           let fbusers = results[1].users.map(u => {
//             return u.email
//           })
//           expect(fbusers).toContain('importme@example.com')

//           // check the user is now in the auth0 list
//           let auth0emails = results[2].map(u => {
//             return u.email
//           })
//           expect(auth0emails).toContain('importme@example.com')

//           // debugger
//           // expect(2).toBe(3)
//         })
//     )
//   })

//   afterEach(() => {
//     if (typeof tempPeep !== 'undefined') {
//       let peepToDelete = {
//         id: tempPeep.id,
//         fields: tempPeep.fields
//       }
//       return importer.fbase.deleteUser(peepToDelete)
//     }
//   })
// })
