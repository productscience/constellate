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
      console.log(user, error)
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

exports.fetchUserList = function (admin) {
  return admin.database().ref('userlist').once('value')
    .then(function (dataSnapshot) {
      return dataSnapshot
    })
}

exports.addUserToUserList = function (user, admin) {
  // adds a user to the userlist data structure in firebase
  return exports.fetchUserList(admin)
    .then(function(dataSnapshot) {
      // console.log(dataSnapshot.val())
      let filteredUsers = userlist.filter(function(returnedUser) {
        return returnedUser.id == user.id
      })
    if (filteredUsers.length === 0) {

      return admin.database().ref('userlist').push(user.id)
        .then(function (key) {
          return admin.database().ref('userlist').child(key).set(user)
        })
    }
    else {
      return
    }
  })
}

exports.updateUserInUserList = function (user, admin) {
    return exports.fetchUserList(admin)
      .then(function(userlist) {
        let filteredUsers = userlist.val().filter(function(returnedUser) {
          return returnedUser.id == user.id
        })
        // return early - we don't want to change this one
        return filteredUsers[0]
      })
}
