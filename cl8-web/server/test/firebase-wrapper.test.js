const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const databaseURL = process.env.FIREBASE_DATABASEURL

const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

const wrapper = require('../src/firebase-wrapper.js')(admin)

// const admin = wrapper.admin

const _ = require('lodash')
const debug = require('debug')('cl8.firebase.wrapper.test')

let testUser

describe('create or delete a user', () => {
  beforeEach(() => {
    testUser = {
      id: 'someRandom',
      fields: {
        email: 'mail@chrisadams.me.uk',
        tags: ['foo', 'bar']
      }
    }
    return wrapper.deleteUser(testUser)
  })

  test('getOrCreateUser', () => {
    expect.assertions(1)
    return wrapper.getOrCreateUser(testUser).then(newUser => {
      debug(newUser)
      expect(newUser.email).toBe(testUser.fields.email)
    })
  })

  test('deleteUser', () => {
    expect.assertions(1)

    // create a user first
    let u = {
      uid: testUser.id,
      email: testUser.fields.email
    }
    return admin
      .auth()
      .createUser(u)
      .then(newUser => {
        // then call our delete method
        let airtableUser = {
          id: newUser.uid,
          fields: {
            email: newUser.email
          }
        }
        return wrapper.deleteUser(airtableUser).then(() => {
          return admin
            .auth()
            .listUsers()
            .then(returnedUsers => {
              expect(returnedUsers.users.length).toBe(0)
            })
        })
      })
  })

  afterEach(() => {
    return admin
      .auth()
      .deleteUser(testUser.uid)
      .catch(err => {
        // eslint-disable-next-line
        if (err.errorInfo.code == 'auth/user-not-found') {
        }
      })
  })
})

describe('fetching actual user accounts', () => {
  const testUserAccount = {
    email: 'mail@chrisadams.me.uk',
    displayName: 'Chris adams',
    emailVerified: true,
    uid: 'xxxxxxxxxxxx'
  }

  beforeEach(async () => {
    const listOfUsers = await admin.auth().listUsers()

    await listOfUsers.users.forEach(async u => {
      debug(`deleting user account ${u.uid}`)
      await admin.auth().deleteUser(u.uid)
    })

    debug(`creating test user account: ${testUserAccount.uid}`)
    await wrapper.admin.auth().createUser(testUserAccount)
  })

  test('getUsers', () => {
    return wrapper.getUsers().then(records => {
      expect(records.length).toBe(1)
      records.forEach(record => {
        expect(record).toHaveProperty('uid')
        expect(record).toHaveProperty('email')
        expect(record).toHaveProperty('emailVerified')
      })
    })
  })

  afterEach(async () => {
    const listOfUsers = await admin.auth().listUsers()

    await listOfUsers.users.forEach(async u => {
      debug(`deleting user account ${u.uid}`)
      await admin.auth().deleteUser(u.uid)
    })
  })
})

describe('create or edit users in realtime database', () => {
  beforeEach(() => {
    // clear the userlist
    testUser = {
      id: 'recXXXXXXXXXXXXXX',
      fields: {
        name: 'Dan',
        email: 'totallynew@domain.com',
        website: 'oldsite.com',
        tags: ['foo', 'bar']
      }
    }
    return wrapper.admin
      .database()
      .ref('userlist')
      .set(null)
  })

  test('getUserList - no users', async () => {
    const userList = await wrapper.getUserList()

    // we can check if a object is an Array like so:
    // userList.constructor === Array
    // but this doesn't work:
    // expect(userList.constructor).toEqual('Array')

    expect(userList.length).toBe(0)
  })

  test('getUserList - at least one user', async () => {
    await wrapper.admin
      .database()
      .ref('userlist')
      .push(testUser)

    const userList = await wrapper.getUserList()

    // check we have an Array returned
    // expect(userList).

    userList.forEach(user => {
      // check we're dealing with a plain ol' js object
      expect(typeof user).toBe('object')

      // check if we can pull out the key
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('fields.email')
      expect(user).toHaveProperty('fields.name')
      expect(user).toHaveProperty('fields.tags')
    })
  })

  test('addUserToUserList - not in list yet', async () => {
    // check we have a bigger list of users
    // check the new user has the info we expect
    // check the
    const initialUserList = await wrapper.getUserList()
    const addUserReq = await wrapper.addUserToUserList(
      testUser,
      initialUserList
    )

    const updatedUserList = await wrapper.getUserList()

    expect(initialUserList.length).toBe(0)
    expect(updatedUserList.length).toBe(1)
    expect(addUserReq.found).toBe(false)
    expect(addUserReq.user.fields.email).toBe(testUser.fields.email)
  })

  test('addUserToUserList - one in list yet', async () => {
    // check we have a bigger list of users
    // check the new user has the info we expect

    await wrapper.admin
      .database()
      .ref('userlist')
      .push(testUser)

    const initialUserList = await wrapper.getUserList()
    const addUserReq = await wrapper.addUserToUserList(
      testUser,
      initialUserList
    )
    const updatedUserList = await wrapper.getUserList()

    expect(initialUserList.length).toBe(1)
    expect(updatedUserList.length).toBe(1)
    expect(addUserReq.found).toBe(true)
    expect(addUserReq.user.fields.email).toBe(testUser.fields.email)
  })

  test('delete by field - email', async () => {
    const initialUserList = await wrapper.getUserList()
    await wrapper.addUserToUserList(testUser, initialUserList)

    const updatedUserList = await wrapper.getUserList()
    expect(updatedUserList.length).toBe(1)

    await wrapper.deleteByfield('email', 'totallynew@domain.com')

    const postDeleteUserList = await wrapper.getUserList()
    expect(postDeleteUserList.length).toBe(0)
  })
})

describe('delete users from realtime database', () => {})

describe('importing users', () => {
  beforeEach(() => {
    testUser = {
      id: 'recXXXXXXXXXXXXXX',
      fields: {
        name: 'Dan',
        email: 'totallynew@domain.com',
        website: 'oldsite.com',
        tags: ['foo', 'bar']
      }
    }
    // clear the userlist
    return wrapper.admin
      .database()
      .ref('userlist')
      .set(null)
  })

  test('addUserToUserList - user already exists, do not update info', async () => {
    let updatedUser = _.cloneDeep(testUser)
    updatedUser.fields.website = 'newsite.com'

    const initialUserList = await wrapper.getUserList()
    const addTestUserReq = await wrapper.addUserToUserList(
      testUser,
      initialUserList
    )

    const updatedUserList = await wrapper.getUserList()
    const secondAddTestUserReq = await wrapper.addUserToUserList(
      updatedUser,
      updatedUserList
    )

    expect(updatedUserList.length).toBe(1)

    // check that we have the initially imported data
    expect(addTestUserReq.found).toBe(false)
    expect(addTestUserReq.user.id).toBe(testUser.id)
    expect(addTestUserReq.user.fields.email).toBe(testUser.fields.email)
    expect(addTestUserReq.user.fields.website).toBe('oldsite.com')

    // check that adding the user twice will not overwrite the data
    expect(secondAddTestUserReq.found).toBe(true)
    expect(secondAddTestUserReq.user.id).toBe(testUser.id)
    expect(secondAddTestUserReq.user.fields.email).toBe(testUser.fields.email)
    expect(secondAddTestUserReq.user.fields.website).toBe('oldsite.com')
  })
})
