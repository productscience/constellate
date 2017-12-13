
let ManagementClient = require('auth0').ManagementClient;

 // you get an auth0 token from
 // https://manage.auth0.com/#/apis/management/explorer
let auth0 = new ManagementClient({
  token: process.env.AUTH0_TOKEN,
  domain: process.env.AUTH0_DOMAIN
});

const auth0Users = process.env.AUTH0_USERS.split(',')

auth0Users.forEach(email => {

  let newUser = {
    "connection": "email",
    "email": email,
    "email_verified": true,
    "verify_email": false,
  }

  auth0.createUser(newUser)
    .then(user => {
      console.log(user)
      return user
    })
    .catch(err => {
      console.log(err)
    })
  }
)
