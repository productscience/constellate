const ProfileThumbnailer = require('../../functions/src/profile-thumbnailer.js')
const debug = require('debug')('cl8.profile-thumbnailer.test')

const serviceAccount = require('../service-account.json')
const testData = require('./testdata.json')
const fs = require('fs')
const _ = require('lodash')
const admin = require('firebase-admin')
const initialisedApp = admin.initializeApp({
  serviceAccount: serviceAccount,
  databaseURL: 'https://munster-setup.firebaseio.com'
})

describe('profileThumbnailer', () => {
  const profileId = 'recj0EMy3sWHhdove'

  // pseudo code
  // const prof = await fetchProfile(profileId)
  // const thumbnailUrls = generateThumbs(photoPath)
  // savedProf = addPhotoUrls(prof)
  // debug(serviceAccount)
  const profThumber = ProfileThumbnailer(initialisedApp, testData)

  test.skip('updateProfile - existing user', () => {})
  test.skip('updateProfile - no user', () => {})

  test('lookupProfile - existing user', async () => {
    // should look like -L5enfF49VrcTmKvXY05

    const prof = await profThumber.lookupProfile('id', profileId)
    debug('key looks like: ', prof)

    // we're testing to see if this looks like a firebase key here
    expect(prof).toMatch(/^-/)
    expect(prof).toHaveLength(20)
  })

  test('fetchProfile - existing user', async () => {
    const profileKey = await profThumber.lookupProfile('id', profileId)
    const profile = await profThumber.fetchProfile(profileKey)

    debug(profile.val())
    expect(profile.val()).toHaveProperty('fields.photo')
    expect(profile.val().fields.photo).toHaveLength(1)
  })

  test.only('addPhotoUrls - existing user', async () => {
    const profileKey = await profThumber.lookupProfile('id', profileId)
    const profile = await profThumber.fetchProfile(profileKey)

    const photoUrls = {
      large: 'http://someurl.com/large.jpg',
      small: 'http://someurl.com/medium.jpg'
    }

    debug('profile', profile.val())
    await profThumber.addPhotoUrls(profile, photoUrls)
    // debug('updatedPhoto', updatedPhoto)
    const newProfile = await profThumber.fetchProfile(profileKey)
    debug('newProfile', newProfile.val())
    expect(newProfile.val()).toHaveProperty('photo.large', photoUrls.large)
    expect(newProfile.val()).toHaveProperty('photo.small', photoUrls.small)
  })
})
