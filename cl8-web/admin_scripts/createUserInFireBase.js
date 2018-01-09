const wrapper = require('./fbauthwrapper.js')

// initialise
const admin = wrapper.admin()

let user = {
    uid: process.env.FIREBASE_USER_UID,
    email: process.env.FIREBASE_USER_EMAIL
}

wrapper.getOrCreateUser(user, admin).then(function (newUser) {
  process.exit()
})
