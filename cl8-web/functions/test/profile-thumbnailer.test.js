const ProfileThumbnailer = require('../../functions/src/profile-thumbnailer.js')
const ThumbnailGenerator = require('../../functions/src/thumbnail-generator.js')
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

debug(serviceAccount)

describe('profileThumbnailer', () => {
  const profileId = 'recj0EMy3sWHhdove'
  const profThumber = ProfileThumbnailer(admin, testData)

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

  test('addPhotoUrls - existing user', async () => {
    const profileKey = await profThumber.lookupProfile('id', profileId)
    const profile = await profThumber.fetchProfile(profileKey)
    debug('profile', profile.val())

    const photoUrls = {
      large: 'http://someurl.com/large.jpg',
      small: 'http://someurl.com/medium.jpg'
    }

    await profThumber.addPhotoUrls(profile, photoUrls)

    const newProfile = await profThumber.fetchProfile(profileKey)
    debug('newProfile', newProfile.val())

    expect(newProfile.val()).toHaveProperty('photo.large', photoUrls.large)
    expect(newProfile.val()).toHaveProperty('photo.small', photoUrls.small)
  })

  test(
    'addPhotoUrls - actual generator',
    async () => {
      const profileKey = await profThumber.lookupProfile('id', profileId)
      const profile = await profThumber.fetchProfile(profileKey)
      debug('profile', profile.val())

      const thumbgen = ThumbnailGenerator(initialisedApp, testData)

      const photoUrls = await thumbgen.createThumbsForProfile(
        'profilePhotos/recj0EMy3sWHhdove-1523955717393',
        'some-outfile.png'
      )

      debug(photoUrls)

      await profThumber.addPhotoUrls(profile, {
        small: photoUrls[0],
        large: photoUrls[1]
      })

      const newProfile = await profThumber.fetchProfile(profileKey)
      debug('newProfile', newProfile.val())

      expect(newProfile.val()).toHaveProperty('photo.small', photoUrls[0])
      expect(newProfile.val()).toHaveProperty('photo.large', photoUrls[1])
    },
    10000
  )
})
