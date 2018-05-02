const ProfileThumbnailer = require('../../functions/src/profile-thumbnailer.js')
const ThumbnailGenerator = require('../../functions/src/thumbnail-generator.js')
const debug = require('debug')('cl8.profile-thumbnailer.test')

const serviceAccount = require('../service-account.json')
const testData = require('./testdata.json')

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

    const photoObject = [
      {
        url: 'someLongString',
        thumbnails: {
          small: { url: 'someLongString' },
          large: { url: 'someLongString' }
        }
      }
    ]

    await profThumber.addPhotoUrls(profile, photoObject)

    const newProfile = await profThumber.fetchProfile(profileKey)
    debug('newProfile - after updating', newProfile.val())

    expect(newProfile.val()).toHaveProperty('fields.photo')
    expect(newProfile.val().fields.photo).toHaveLength(1)
    expect(newProfile.val().fields.photo).toEqual(photoObject)
  })

  test('isProfilePic -  photo is a profile', async () => {
    expect(profThumber.isProfilePic(testData)).toBe(profileId)
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

      // item.fields.photo[0].thumbnails.small.url
      const photoObject = [
        {
          thumbnails: {
            small: {
              url: photoUrls[0]
            },
            large: {
              url: photoUrls[1]
            }
          }
        }
      ]
      await profThumber.addPhotoUrls(profile, photoObject)

      const newProfile = await profThumber.fetchProfile(profileKey)
      // debug('newProfile', newProfile.val())
      expect(newProfile.val()).toHaveProperty('fields.photo')
      expect(newProfile.val().fields.photo).toHaveLength(1)

      const profilePhotoObj = newProfile.val().fields.photo[0]
      expect(profilePhotoObj).toHaveProperty('thumbnails.small.url')
      expect(profilePhotoObj).toHaveProperty('thumbnails.large.url')
    },
    15000
  )
})
