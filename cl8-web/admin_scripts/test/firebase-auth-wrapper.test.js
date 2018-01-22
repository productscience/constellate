const serviceAccount = require('../' +
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH_TEST)
const databaseURL = process.env.FIREBASE_DATABASE_URL_TEST

const wrapper = require('../../functions/src/firebase-auth-wrapper.js')(
  serviceAccount,
  databaseURL
)
const admin = wrapper.admin

const _ = require('lodash')
let testUser

describe('create or delete a user', () => {
  beforeEach(() => {
    testUser = {
      id: 'someRandom',
      fields: {
        email: 'mail@chrisadams.me.uk'
      }
    }
    return wrapper.deleteUser(testUser)
  })

  test('getOrCreateUser', () => {
    expect.assertions(1)
    return wrapper.getOrCreateUser(testUser).then(newUser => {
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
        if (err.errorInfo.code == 'auth/user-not-found') {
          return
        }
      })
  })
})

describe('fetching actual user records', () => {
  test('getUsers', () => {
    return wrapper.getUsers().then(records => {
      // let record = records.users[0]
      records.users.forEach(record => {
        expect(record).toHaveProperty('uid')
        expect(record).toHaveProperty('email')
        expect(record).toHaveProperty('emailVerified')
      })
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
        website: 'oldsite.com'
      }
    }
    return wrapper.admin
      .database()
      .ref('userlist')
      .set(null)
  })

  test('getUserList', () => {
    return wrapper.admin
      .database()
      .ref('userlist')
      .push(testUser)

    return wrapper.getUserList().then(records => {
      // check if we can pull out the key
      records.forEach(user => {
        expect(user.val()).toHaveProperty('id')
        expect(user.val()).toHaveProperty('fields.email')
        expect(user.val()).toHaveProperty('fields.name')
        // not every user has tags now
        expect(user.val()).toHaveProperty('fields.tags')
      })
    })
  })

  test('addUserToUserList', () => {
    expect.assertions(2)
    return wrapper.addUserToUserList(testUser).then(newUser => {
      expect(newUser.id).toBe(testUser.id)
      expect(newUser.fields.email).toBe(testUser.fields.email)
    })
  })
})

describe('importing users', () => {
  beforeEach(() => {
    // clear the userlist
    return wrapper.admin
      .database()
      .ref('userlist')
      .set(null)
  })

  test('addUserToUserList - user already exists', () => {
    expect.assertions(3)
    // this user looks different as it's from airtable

    let updatedUser = _.cloneDeep(testUser)
    updatedUser.fields.website = 'newsite.com'

    return wrapper.addUserToUserList(testUser).then(returnedUser => {
      return wrapper.updateUserInUserList(updatedUser).then(newUser => {
        expect(newUser.id).toBe(testUser.id)
        expect(newUser.fields.email).toBe(testUser.fields.email)
        expect(newUser.fields.website).toBe('oldsite.com')
      })
    })
  })
})
