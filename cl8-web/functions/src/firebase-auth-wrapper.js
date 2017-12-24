const fbadmin = require('firebase-admin')
const _ = require('lodash')
const debug = require('debug')('firebase-auth-wrapper')

module.exports = FireBaseAuthWrapper

function FireBaseAuthWrapper (serviceAccount, dbUrl) {
  var admin = fbadmin.initializeApp({
    credential: fbadmin.credential.cert(serviceAccount),
    databaseURL: dbUrl
  })

  function getUsers () {
    return admin.auth().listUsers()
  }

  function deleteUser (user) {
    console.log(user)
    // We can't control the ids these use, so we're better off:
    // fetching by email, then
    // fetch the id
    return admin.auth().getUserByEmail(user.fields.email)
      .then(returnedUser => {
        // console.log(returnedUser.uid)
        return admin.auth().deleteUser(returnedUser.uid)
          .catch(err => {
            console.log('auth:error')
            console.log(err)
          })
      })
      .catch(function (error) {
        if (error.errorInfo.code == 'auth/user-not-found') {
          console.log('user no longer exists:', user.fields.email)
        }
        return user
        // console.log(error)
      })
  }

  function checkForUser (user) {
    return admin.auth().getUserByEmail(user.fields.email)
      .then(function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully fetched user data:', userRecord.uid, userRecord.email)
        return userRecord
      })
  }

  function getOrCreateUser (user) {
    return checkForUser(user)
      .then(function (newUser) {
        // console.log('found user:', newUser)
        return newUser
      })
      .catch(function (error) {
        if (error.errorInfo.code == 'auth/user-not-found') {
          let u = {
            uid: user.id,
            email: user.fields.email
          }
          return admin.auth().createUser(u)
            .then(function (newUser) {
              console.log('Successfully created new user:', u.uid, u.email)
              // debugger
              return newUser
            })
            .catch(err => {
              if (err.errorInfo.code == '"auth/uid-already-exists"') {
                return newUser
              }
            })
        }
        if (error.errorInfo.code == 'auth/email-already-exists') {
          console.log(error.errorInfo.message, user.email)
          return user
        }
      })
  }

  function getUserList () {
    return admin.database().ref('userlist').once('value')
      .then(function (dataSnapshot) {
        return dataSnapshot
      })
  }

  function addUserToUserList (user) {
    // adds a user to the userlist data structure in firebase
    return getUserList(admin)
      .then(function (dataSnapshot) {
        let userlist = dataSnapshot.val()
        let usersArray = _.values(userlist)

        function matchesUserId (returnedUser) {
          return returnedUser.id == user.id
        }
        // console.log(user)
        let filteredUsers = _.filter(usersArray, matchesUserId)
        // console.log(filteredUsers)
        if (filteredUsers.length === 0) {
          // console.log(user.fields)
          // console.log(user)
          return dataSnapshot.ref.push(user)
            .then(reference => {
              // console.log(user)
              // return user
              return reference.once('value')
                .then(snap => {
                  console.log(snap.val())
                  return user
                })
              // console.log(reference.key)
              // console.log(reference.toJSON())
              // console.log(reference.ref.toJSON())
              // console.log(user._rawJson)
              // return reference
            }).catch(err => {
              return console.log(err)
            })
            // .then(function() {
              // return key.set(user)
            // })
        } else {
          // console.log("returning the original", filteredUsers[0])
          return filteredUsers[0]
        }
      })
  }

  function removeUserfromUserList (user) {

  }

  function updateUserInUserList (user) {
    return getUserList(admin)
      .then(function (userlist) {
        let usersArray = _.values(userlist.val())
        // console.log(usersArray[1])
        let filteredUsers = usersArray.filter(function (returnedUser) {
          return returnedUser.id == user.id
        })
        // return early - we don't want to change this one
        return filteredUsers[0]
      })
  }

  return {
    getUsers: getUsers,
    deleteUser: deleteUser,
    checkForUser: deleteUser,
    getOrCreateUser: getOrCreateUser,
    getUserList: getUserList,
    addUserToUserList: addUserToUserList,
    updateUserInUserList: updateUserInUserList,
    admin: admin
  }
}
