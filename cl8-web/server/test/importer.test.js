const debug = require('debug')('cl8.importer.test')

const Cl8Importer = require('../../functions/src/importer.js')

const devBase = process.env.AIRTABLE_BASE_TEST
const devKey = process.env.AIRTABLE_API_KEY_TEST
const peepTable = process.env.AIRTABLE_PERSON_NAME_TEST

const serviceAccount = require('../' +
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH_TEST)
const databaseURL = process.env.FIREBASE_DATABASE_URL_TEST

const firebaseAdmin = require('firebase-admin')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

const importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: firebaseAdmin
}

const importer = Cl8Importer(importerCredentials)

jest.setTimeout(30000)

async function clearAirtable () {
  debug('clearAirtable: clearing airtable')
  const noStaleTestUsers = "{email} = 'importme@example.com'"
  const usersToNuke = await importer.atbl.fetchRecords(
    'peeps',
    noStaleTestUsers
  )

  for (let peep of usersToNuke) {
    debug('deleting peep from airtable: ', peep.id)
    try {
      const nukedUser = await importer.atbl.airtable('peeps').destroy(peep.id)
      debug('deleted airtable peep: ', nukedUser.id)
    } catch (e) {
      debug('problem nuking user from airtable:', peep.id)
      debug(e)
    }
  }
  debug('clearAirtable: cleared airtable')
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

async function clearFirebaseUserList () {
  // we don't use this later on, so we don't assign it to to a value
  await importer.fbase.admin
    .database()
    .ref('userlist')
    .set(null)
}

async function addPeepsToFireBaseUserList (peeps, tags) {
  debug('addPeepsToFireBaseUserList: add to userlist')
  const initialUserList = await importer.fbase.getUserList()
  debug('initialUserList', initialUserList)
  for (let peep of peeps) {
    const userObj = { id: peep.id, fields: peep.fields }
    const resp = await importer.fbase.addUserToUserList(
      userObj,
      initialUserList
    )
    debug('addUser result:', resp.found, resp.user.fields.email, resp.user.id)
  }
  debug('addPeepsToFireBaseUserList: added to userlist')
}

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
      expect(payload).toHaveProperty('fbUserList')
      // 10000 is for a longer to timeout as we're waiting for
      // loads of API calls to return
    },
    10000
  )
})

describe('finding new users to import', () => {
  let payload = {}
  let peeps
  let tags

  beforeEach(async () => {
    await clearAirtable()
    await clearFirebaseAccounts()
    await clearFirebaseUserList()

    tags = await importer.atbl.getTags()
    peeps = await importer.atbl.getUsers()

    debug('before: peeps.length: ', peeps.length)
    debug('before: tags.length: ', tags.length)

    await addPeepsToFireBaseUserList(peeps, tags)

    // fetch the up to date list of users
    const fbaseUserList = await importer.fbase.getUserList()

    payload.peeps = peeps
    payload.tags = tags
    payload.fbUserList = fbaseUserList
  }, 30000)

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
      expect(enrichedPeeps.length).toBe(peeps.length)
      expect(payload.fbUserList.length).toBe(peeps.length)
      expect(usersToImport.length).toBe(0)
    },
    15000
  )

  test(
    'filterOutPeepsToImport - one to import',
    async () => {
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

      const enrichedPeeps = importer.buildEnrichedPeeps(
        updatedPeeps,
        updatedTags
      )

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
    },
    30000
  )
})

describe('importing users', () => {
  let payload = {}
  let peeps
  let tags

  beforeEach(async () => {
    await clearAirtable()
    await clearFirebaseAccounts()
    await clearFirebaseUserList()

    tags = await importer.atbl.getTags()
    peeps = await importer.atbl.getUsers()

    debug('before: peeps.length: ', peeps.length)
    debug('before: tags.length: ', tags.length)

    await addPeepsToFireBaseUserList(peeps, tags)

    // fetch the up to date list of users
    const fbaseUserList = await importer.fbase.getUserList()

    payload.peeps = peeps
    payload.tags = tags
    payload.fbUserList = fbaseUserList
  }, 30000)

  test(
    'importUsersAcrossServices - none to import',
    async () => {
      // this should do nothing

      const enrichedPeeps = importer.buildEnrichedPeeps(
        payload.peeps,
        payload.tags
      )

      const usersToImport = importer.filterOutPeepsToImport(
        enrichedPeeps,
        payload.fbUserList
      )

      const importedPeeps = await importer.importUsersAcrossServices(
        usersToImport,
        payload.fbUserList
      )

      // check we have the same list of users
      // check we have the same list of firebase users
      expect(importedPeeps.length).toBe(0)
    },
    30000
  )

  test(
    'importUsersAcrossServices - one to import',
    async () => {
      // establish users to import
      const newAirtableUserPayload = {
        name: 'Person to import',
        email: 'importme@example.com',
        visible: 'yes',
        admin: 'false',
        tags: []
      }

      await importer.atbl.airtable(peepTable).create(newAirtableUserPayload)

      const updatedPeeps = await importer.atbl.getUsers()
      const updatedTags = await importer.atbl.getTags()

      expect(updatedPeeps.length).toBe(updatedPeeps.length)
      expect(payload.fbUserList.length).toBe(peeps.length)

      const enrichedPeeps = importer.buildEnrichedPeeps(
        updatedPeeps,
        updatedTags
      )

      expect(enrichedPeeps.length).toBe(updatedPeeps.length)

      const usersToImport = importer.filterOutPeepsToImport(
        enrichedPeeps,
        payload.fbUserList
      )

      expect(usersToImport.length).toBe(1)

      const importedPeeps = await importer.importUsersAcrossServices(
        usersToImport,
        payload.fbUserList
      )

      const updatedFirebaseUserList = await importer.fbase.getUserList()
      const updatedFirebaseAccountList = await importer.fbase.getUsers()

      // check we have one imported
      debug(importedPeeps)
      expect(importedPeeps.length).toBe(1)

      // check we have the updated list of firebase users
      expect(updatedFirebaseAccountList.length).toBe(1)

      // check we have the updated list of firebase accounts
      expect(payload.fbUserList.length).toBe(peeps.length)
      expect(updatedFirebaseUserList.length).toBe(updatedPeeps.length)

      //
    },
    30000
  )
})

describe('running import command as blackbox', () => {
  let tags
  let peeps

  beforeEach(async () => {
    await clearAirtable()
    await clearFirebaseAccounts()
    await clearFirebaseUserList()
    tags = await importer.atbl.getTags()
    peeps = await importer.atbl.getUsers()
    await addPeepsToFireBaseUserList(peeps, tags)
  }, 30000)

  test(
    'importUsersAndTags - none to import',
    async () => {
      const importResult = await importer.importUsersAndTags()

      expect(importResult.imported.length).toBe(0)
      expect(importResult.skipped.length).toBe(peeps.length)
    },
    30000
  )

  test(
    'importUsersAndTags - one to import',
    async () => {
      const newAirtableUserPayload = {
        name: 'Person to import',
        email: 'importme@example.com',
        visible: 'yes',
        admin: 'false',
        tags: []
      }

      await importer.atbl.airtable(peepTable).create(newAirtableUserPayload)

      const importResult = await importer.importUsersAndTags()

      expect(importResult.imported.length).toBe(1)
      expect(importResult.skipped.length).toBe(peeps.length)
    },
    30000
  )
})
