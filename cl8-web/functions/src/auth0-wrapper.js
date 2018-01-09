const ManagementClient = require('auth0').ManagementClient
// const AuthenticationClient = require('auth0').AuthenticationClient
const debug = require('debug')('cl8-auth0-wrapper')
 // you get an auth0 token from
 // https://manage.auth0.com/#/apis/management/explorer

module.exports = Auth0Wrapper

function Auth0Wrapper (auth0Token, auth0Domain) {
  // debug(auth0Token)
  // debug(auth0Domain)
  // var auth0 = function () {

    // TODO this is such a pain
    // I've cheated by using the explorer at the link below to create a longer
    // lasting token, to access the API for tests. Really, we should automate
    // the process but it'll take a while to grok the new process:
    // https://auth0.com/docs/api/management/v2/tokens#automate-the-process

    // https://manage.auth0.com/#/apis/management/explorer

    // let authclient = new AuthenticationClient({
    //   domain: process.env.AUTH0_DOMAIN,
    //   clientId: process.env.AUTH0_API_EXPLORER_CLIENT_ID,
    //   clientSecret: process.env.AUTH0_API_EXPLORER_CLIENT_SECRET
    // })
    //
    // let scopes = "read:client_grants create:client_grants delete:client_grants update:client_grants read:users update:users delete:users create:users read:users_app_metadata update:users_app_metadata delete:users_app_metadata create:users_app_metadata"
    //
    // return authclient.clientCredentialsGrant({
    //   audience: process.env.AUTH0_AUTH_TOKEN_AUDIENCE,
    //   scope: scopes
    // })
    // .then(response => {
    //   debug(response)
    //   return response
    // })
    // .catch(error => {
    //   debug(error)
    // })
    // .then(response =>{

  var auth0 = new ManagementClient({
    token: auth0Token,
    domain: auth0Domain
  })
  // debug(auth0)
    // })

  function getOrCreateUser (userEmail) {
    // this hides the email checking, so we don't spam people
    // with the invite
    let user = {
      'connection': 'email',
      'email': userEmail,
      'email_verified': true,
      'verify_email': false
    }
    return auth0.createUser(user)
      .then(newUser => {
        debug('auth0 user', newUser.email)
        return newUser
      })
      .catch(err => {
        debug(err)
      })
  }

  function makeAdminUserByEmail (emailAddress) {
    return auth0.getUsersByEmail(emailAddress)
      .then(function (users) {
        // debug(users)
        return (users)
      })
      .then(function (users) {
        let uid = users[0].user_id
        let params = { admin: true }
        return updateUser(uid, params, auth0)
      })
  }

  function addAirtableAPIToUserByEmail (emailAddress, params) {
    return auth0.getUsersByEmail(emailAddress)
      .then(function (users) {
        debug(users)
        if (users.length > 0) {
          let uid = users[0].user_id
          return updateUser(uid, params)
        }
      })
  }

  function removeUser (emailAddress) {
    return auth0.getUsersByEmail(emailAddress)
      .then(function (users) {
        if (users.length > 0) {
          let uid = users[0].user_id
          return auth0.deleteUser({id: uid})
        }
      })
  }

  function updateUser (uid, params) {
    return auth0.updateAppMetadata({id: uid}, params)
      .then(function (user) {
        debug('user updated')
        // debug(user)
        return user
      })
  }

  function getUsers () {
    return auth0.getUsers()
  }

  function getUsersByEmail (email) {
    return auth0.getUsersByEmail(email)
  }

  return {
    auth0: auth0,
    getOrCreateUser: getOrCreateUser,
    removeUser: removeUser,
    makeAdminUserByEmail: makeAdminUserByEmail,
    addAirtableAPIToUserByEmail: addAirtableAPIToUserByEmail,
    updateUser: updateUser,
    getUsers: getUsers,
    getUsersByEmail: getUsersByEmail
  }
}
