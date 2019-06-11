'use strict'

/**
 * Extract user from request authorized with bearer token
 *
 * @param {*} req
 * @param {*} resp
 */
exports.tokenAuth = async (req, admin) => {
  let reqUser = null
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    console.error('Received AddUsers request without authorization token')
    throw Error('Request missing authorization header')
  }

  try {
    const authToken = req.headers.authorization.split('Bearer ')[1]
    reqUser = await admin.auth().verifyIdToken(authToken)
  } catch (err) {
    console.error('Error decoding user auth token: ', err.message)
    throw Error('Unauthorized')
  }

  return reqUser
}

/**
 * Return true if a request was sent by a user that is marked as being an admin
 * in the database
 *
 * @param {*} req
 * @param {*} resp
 */
exports.checkAdmin = async (req, admin) => {
  const reqUser = await exports.tokenAuth(req, admin)

  // Retrieve associated user profile
  const userRecord = await admin
    .database()
    .ref('userlist')
    .orderByChild('id')
    .equalTo(reqUser.user_id)
    .once('value')

  if (userRecord.val() == null) {
    console.error('Requesting user has no associated user profile')
    return false
  }

  // Whether a user is admin is stored in <profile>/fields/admin
  // either as "yes" or true
  console.log(JSON.stringify(userRecord.val(), null, 2))
  const userProfile = userRecord.val()[reqUser.user_id]
  if (userProfile == null)
    throw new Error(
      'Error checking for admin privilege: requesting user has no cl8 profile'
    )
  const isAdmin =
    userProfile.fields.admin == true || userProfile.fields.admin === 'yes'

  if (isAdmin != true) console.error('Requesting user has no admin privilege')

  return isAdmin === true
}
