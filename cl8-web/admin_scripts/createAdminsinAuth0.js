
var ManagementClient = require('auth0').ManagementClient;

 // you get an auth0 token from
 // https://manage.auth0.com/#/apis/management/explorer
var auth0 = new ManagementClient({
  token: process.env.AUTH0_TOKEN,
  domain: process.env.AUTH0_DOMAIN
});

const adminUsers = process.env.AUTH0_ADMIN_USERS.split(',')

adminUsers.forEach(function(email) {
  makeAdminUser(email)
})

function makeAdminUser (emailAddress) {
  return auth0.getUsersByEmail(emailAddress)
    .then(function (users) {
      console.log(users)
      return (users)
    })
    .then(function (users) {
      let uid = users[0].user_id
      let params = { admin: true }
      return updateUser(uid, params)
    })
}

function updateUser(uid, params) {
  return auth0.updateAppMetadata({id: uid}, params)
    .then(function (user) {
      console.log('user updated')
      console.log(user)
    })
}
