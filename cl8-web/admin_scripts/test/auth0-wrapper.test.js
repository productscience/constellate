
// test that running the importer will only create
// new users if they aren't in the list already

const wrapper = require('../../functions/src/auth0-wrapper.js')(process.env.AUTH0_TOKEN, process.env.AUTH0_DOMAIN)
const auth0 = wrapper.auth0

let user = null

function makeUser (user) {
  let auth0User = {
    'connection': 'email',
    'email': user.email,
    'email_verified': true,
    'verify_email': false
  }
  return wrapper.auth0.createUser(auth0User)
}

function deleteUser (emailAddress) {
  return auth0.getUsersByEmail(emailAddress)
    .then(function (users) {
      if (users.length > 0) {
        let uid = users[0].user_id
        return auth0.deleteUser({id: uid})
      }
    })
}

describe('creating and deleting a user', () => {
  beforeEach(() => {
    user = {
      email: 'mail+testing@chrisadams.me.uk',
      firebaseId: 'bishboshbishbosh'
    }
    return makeUser(user)
  })

  test('getOrCreateUser', () => {
    expect.assertions(1)
    return wrapper.getOrCreateUser(user.email).then(newUser => {
      expect(newUser.email).toBe(user.email)
    })
  })

  test('removeUser', () => {
    expect.assertions(1)
    return wrapper.removeUser(user.email).then(deletedUser => {
      return auth0.getUsersByEmail(user.email).then(users => {
        expect(users.length).toBe(0)
      })
    })
  })

  afterEach(() => {
    return deleteUser(user.email)
  })
})

describe('editing a user', () => {
  beforeEach(() => {
    user = {
      email: 'mail+testing@chrisadams.me.uk',
      firebaseId: 'bishboshbishbosh'
    }
    return makeUser(user)
  })

  test('it can make a user admin, based on email address', () => {
    expect.assertions(2)
    return wrapper.makeAdminUserByEmail(user.email).then(newUser => {
      expect(newUser.email).toBe(user.email)
      expect(newUser.app_metadata.admin).toBe(true)
    })
  })

  test("it can add a user's id from airable for firebase", () => {
    let userParams = { firebaseId: user.firebaseId }
    expect.assertions(2)
    return wrapper.addAirtableAPIToUserByEmail(user.email, userParams).then(newUser => {
      expect(newUser.email).toBe(user.email)
      expect(newUser.app_metadata.firebaseId).toBe(user.firebaseId)
    })
  })
})

describe('working with multiple users', () => {
  test('getUsers', () => {
    wrapper.getUsers().then(users => {
      users.forEach(u => {
        expect(u).toHaveProperty('email')
        expect(u).toHaveProperty('email_verified', true)
        // not every record has this, but should
        // expect(u).toHaveProperty('name')
        // expect(u).toHaveProperty('app_metadata.firebaseId')
      })
    })
  })
})
