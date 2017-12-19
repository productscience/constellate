const fbadmin = require('firebase-admin')
const _ = require('lodash')


module.exports = FireBaseAuthWrapper

function FireBaseAuthWrapper ( serviceAccount, dbUrl ) {

  var admin = fbadmin.initializeApp({
    credential: fbadmin.credential.cert(serviceAccount),
    databaseURL: dbUrl
  })

  function deleteUser (user) {
    // We can't control the ids these use, so we're better off:
    // fetching by email, then
    // fetch the id
    return admin.auth().getUserByEmail(user.fields.email)
    .then(returnedUser => {
        // console.log(returnedUser.uid)
        return admin.auth().deleteUser(returnedUser.uid)
    })
    .catch(err => {
        console.log(err)
    })
  }

  function checkForUser (user) {
    return admin.auth().getUserByEmail(user.fields.email)
    // return admin.auth().getUserByEmail(user.email)
      .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully fetched user data:", userRecord.uid, userRecord.email);
        return userRecord
      }).catch(err =>{
        console.log(err)
        return false
      })
  }

  function getOrCreateUser (user) {
    return checkForUser(user)
      .then(function (newUser) {
        console.log('found user:', newUser)
        return newUser
      })
      .catch(function(error) {
        // console.log(error)
        // console.log(user, error)
        if (error.errorInfo.code == 'auth/user-not-found') {
          let u = {
            uid: user.id,
            email: user.fields.email
            // uid: user.uid,
            // email: user.email
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

  function fetchUserList () {
    return admin.database().ref('userlist').once('value')
      .then(function (dataSnapshot) {
        return dataSnapshot
      })
  }

  function addUserToUserList (user) {
    // adds a user to the userlist data structure in firebase
    return fetchUserList(admin)
      .then(function(dataSnapshot) {
        let userlist = dataSnapshot.val()
        let usersArray = _.values(userlist)

        function matchesUserId (returnedUser) { return returnedUser.id == user.id}

        let filteredUsers = _.filter(usersArray, matchesUserId)
        if (filteredUsers.length === 0) {
          return admin.database().ref('userlist').push(user.id)
            .then(function (key) {
              return key.set(user)
            })
        }
        else {
          // console.log("returning the original", filteredUsers)
          return filteredUsers[0]
      }
    })
  }

  function updateUserInUserList (user) {
      return fetchUserList(admin)
        .then(function(userlist) {
          let usersArray = _.values(userlist.val())
          // console.log(usersArray[1])
          let filteredUsers = usersArray.filter(function(returnedUser) {
            return returnedUser.id == user.id
          })
          // console.log(filteredUsers)
          // return early - we don't want to change this one
          return filteredUsers[0]
        })
  }

  return {
        deleteUser: deleteUser,
        checkForUser: deleteUser,
        getOrCreateUser: getOrCreateUser,
        fetchUserList: fetchUserList,
        addUserToUserList: addUserToUserList,
        updateUserInUserList: updateUserInUserList
  }
}
