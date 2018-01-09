const serviceAccount = require('../' + process.env.FIREBASE_SERVICE_ACCOUNT_PATH_TEST)
const databaseURL = process.env.FIREBASE_DATABASE_URL_TEST

const wrapper = require('../../functions/src/firebase-auth-wrapper.js')(serviceAccount, databaseURL)


return wrapper.admin.database().ref('userlist')
    .orderByChild('fields/email').equalTo('importme@example.com')
    .once('value', peep => {
      peep.forEach(u => {
        return u.ref.remove()
      })
    })
    return process.exit()
