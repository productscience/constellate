const admin = require('firebase-admin')

var serviceAccount = require('../functions/service-account.json')

exports.admin = function () {
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  })
}

exports.deleteUser = function (uid, admin) {
  return admin.auth().deleteUser(uid)
}

exports.checkForUser = function (uid, admin) {
  return admin.auth().getUser(uid)
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully fetched user data:", userRecord.uid, userRecord.email);
      return userRecord
    })
}

exports.getOrCreateUser = function (user, admin) {
  return exports.checkForUser(user.uid, admin)
    .then(function (newUser) { return newUser })
    .catch(function(error) {
      // console.log(error)
      console.log(user)
      if (error.errorInfo.code == 'auth/user-not-found') {
        let u = {
          uid: user.uid,
          email: user.email
        }
        return admin.auth().createUser(u)
          .then(function(newUser) {
            console.log('Successfully created new user:', u.uid, u.email)
            return newUser
          })
      }
      if (error.errorInfo.code == 'auth/email-already-exists') {
          console.log(error.errorInfo.message, user.email)
          return user
      }
    });
}

exports.updateUserInUserList = function (user, admin) {
  // replace this with code running an actual promise
  return new Promise(function (resolve, reject) {
    let u = { uid: false,  email: 'false@domain.com'}
    return resolve(u)
  })
    .then(function (user) { return user })
}
