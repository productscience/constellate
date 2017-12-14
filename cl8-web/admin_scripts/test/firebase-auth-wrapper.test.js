const wrapper = require('../firebase-auth-wrapper.js')

// initialise
const admin = wrapper.admin()

let user = {
    uid: "someRandom",
    email: "mail+testing@chrisadams.me.uk"
}

test('can create a user in one go', () => {
  expect.assertions(1)
  return wrapper.getOrCreateUser(user, admin).then(newUser => {
    expect(newUser.email).toBe(user.email)
  })
})


test('can add user to userlist', () => {
  expect.assertions(2)
  return wrapper.updateUserInUserList(user, admin).then(newUser => {
    expect(newUser.uid).toBe(user.uid)
    expect(newUser.email).toBe(user.email)
  })
})
