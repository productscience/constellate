const wrapper = require('../firebase-auth-wrapper.js')

// initialise
const admin = wrapper.admin()

test('can create a user in one go', () => {
  let testUser = {
      uid: "someRandom",
      email: "mail+testing@chrisadams.me.uk"
  }
  expect.assertions(1)
  return wrapper.getOrCreateUser(testUser, admin).then(newUser => {
    expect(newUser.email).toBe(testUser.email)
  })
})

test('it can fetch a userlist from firebase', () => {
  return wrapper.fetchUserList(admin).then(userlist => {
    expect(userlist.length > 200)
  })
})
//
// test('can add user to userlist in firebase', () => {
//   let testUser = {
//     id: 'recXXXXXXXXXXXXXX',
//     fields: {
//       email: 'totallynew@domain.com',
//       website: "newsite.com"
//     }
//   }
//   expect.assertions(2)
//   return wrapper.addUserToUserList(testUser, admin).then(newUser => {
//     expect(newUser.id).toBe(testUser.fields.id)
//     expect(newUser.fields.email).toBe(testUser.fields.email)
//   })
// })

test("won't overwrite a user already imported from airtable", () => {
  // this user looks  different as it's from airtable
  let existingUser = {
    id: 'rec0CSbkZBm1wWluF',
    fields: {
      email: 'danny@spesh.com',
      website: "newsite.com"
    }
  }
  expect.assertions(3)
  return wrapper.updateUserInUserList(existingUser, admin).then(newUser => {
    expect(newUser.id).toBe(existingUser.id)
    expect(newUser.fields.email).toBe(existingUser.fields.email)
    expect(newUser.fields.website).toBe("spesh.com")
  })
})

// {
// createdTime: '2017-11-11T12:40:59.000Z',
// fields:
//  { admin: 'false',
//    email: 'danny@spesh.com',
//    name: 'Danny O\'Brien',
//    tags: [ [Object], [Object], [Object] ],
//    website: 'spesh.com' },
// id: 'rec0CSbkZBm1wWluF'
// }
