const ProfileThumbnailer = require('../../functions/src/profile-thumbnailer.js')
const debug = require('debug')('cl8.profile-thumbnailer.test')

const serviceAccount = require('../service-account.json')
const testData = require('./testdata.json')

const fs = require('fs')

describe('profileThumbnailer', () => {
  const profileId = 'recj0EMy3sWHhdove'

  // pseudo code
  // const prof = await fetchProfile(profileId)
  // const thumbnailUrls = generateThumbs(photoPath)
  // savedProf = addPhotoUrls(prof)
  // debug(serviceAccount)
  const profThumber = ProfileThumbnailer(
    {
      serviceAccount: serviceAccount,
      databaseURL: 'https://munster-setup.firebaseio.com'
    },
    testData
  )

  test.skip('updateProfile - existing user', () => {})
  test.skip('updateProfile - no user', () => {})

  test.only('fetchProfile - existing user', async () => {
    const prof = await profThumber.fetchProfile(profileId)

    debug(prof.val())
    expect(prof.val().resolves.toHaveProperty('fields'))
  })
})
