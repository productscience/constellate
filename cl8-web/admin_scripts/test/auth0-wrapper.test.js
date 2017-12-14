
// test that running the importer will only create
// new users if they aren't in the list already

const wrapper = require('../auth0-wrapper.js')

// initialise
const auth0 = wrapper.admin()

let user = {
    email: 'mail+testing@chrisadams.me.uk'
}

test('can create a user in one go', () => {
  expect.assertions(1);
  return wrapper.getOrCreateUser(user.email, auth0).then(newUser => {
    expect(newUser.email).toBe(user.email)
  })
})

test('it can make a user admin, based on email address', () => {
  expect.assertions(2);
  return wrapper.makeAdminUserByEmail(user.email, auth0).then(newUser => {
    expect(newUser.email).toBe(user.email)
    expect(newUser.app_metadata.admin).toBe(true)
  });
})
