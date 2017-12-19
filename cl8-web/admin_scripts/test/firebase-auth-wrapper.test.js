const serviceAccount = require('../' + process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
const databaseURL = process.env.FIREBASE_DATABASE_URL

const wrapper = require('../../functions/src/firebase-auth-wrapper.js')(serviceAccount, databaseURL)

test('can create a user in one go', () => {
  let testUser = {
      id: "someRandom",
      fields: {
        email: "mail@chrisadams.me.uk"
      }
  }
  expect.assertions(1)
  return wrapper.getOrCreateUser(testUser).then(newUser => {
    expect(newUser.email).toBe(testUser.fields.email)
  })
})

test('it can fetch a userlist from firebase', () => {
  return wrapper.fetchUserList().then(userlist => {
    expect(userlist.length > 200)
  })
})

test('can add user to userlist in firebase', () => {
  let testUser = {
    id: 'recXXXXXXXXXXXXXX',
    fields: {
      email: 'totallynew@domain.com',
      website: "newsite.com"
    }
  }
  expect.assertions(2)
  return wrapper.addUserToUserList(testUser).then(newUser => {
    expect(newUser.id).toBe(testUser.id)
    expect(newUser.fields.email).toBe(testUser.fields.email)
  })
})
//
test("won't overwrite a user already imported from airtable", () => {
  // this user looks  different as it's from airtable
  let existingUser = {
    id: 'rec0CSbkZBm1wWluF',
    fields: {
      email: 'danny@spesh.com',
      website: "newsite.com"
    }
  }
  let updatedUser = {
    id: 'rec0CSbkZBm1wWluF',
    fields: {
      email: 'danny@spesh.com',
      website: "newnewsite.com"
    }
  }
  // expect.assertions(3)
  // return wrapper.deleteUser(existingUser, admin).then(() => {
    return wrapper.addUserToUserList(existingUser).then(returnedUser => {
      return wrapper.updateUserInUserList(updatedUser).then(newUser => {
        console.log(returnedUser)
        console.log(newUser)
        expect(newUser.id).toBe(existingUser.id)
        expect(newUser.fields.email).toBe(existingUser.fields.email)
        expect(newUser.fields.website).toBe("newsite.com")
      })
    })
  // })

})
