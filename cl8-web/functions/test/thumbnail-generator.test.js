const ThumbnailGenerator = require('../../functions/src/thumbnail-generator.js')
const debug = require('debug')('cl8.thumbnail-generator.test')
const serviceAccount = require('../service-account.json')
const testData = require('./testdata.json')
const fs = require('fs')
const admin = require('firebase-admin')

describe('thumbnailGenerator', () => {
  const fileName = 'test_pic.png'
  const smallThumbFileName = 'thumb_test_pic-36x36.png'
  const largeThumbFileName = 'thumb_test_pic-200x200.png'

  // const initialisedApp = admin.initializeApp({
  //   serviceAccount: serviceAccount,
  //   databaseURL: 'https://munster-setup.firebaseio.com'
  // })
  const thumbGen = ThumbnailGenerator(
    { serviceAccount: serviceAccount },
    testData
  )

  debug(thumbGen)
  // const thumbGen = ThumbnailGenerator(admin, testData)

  test('validateObject', () => {
    debug(thumbGen)
    expect(thumbGen.validateObject()).toBe(true)
  })

  test('fetchImage with nested path', async () => {
    // TODO nuke this to make sure we don't need to fetch it each time

    if (fs.existsSync('outfile.png')) {
      fs.unlinkSync('outfile.png')
    }

    const fetchRequest = thumbGen.fetchImage(
      'profilePhotos/recj0EMy3sWHhdove-1523955717393',
      'outfile.png'
    )
    await expect(fetchRequest).resolves.toBe('outfile.png')
    expect(fs.existsSync('outfile.png')).toBe(true)
  })

  test('makeThumbnails', async () => {
    const fetchRequest = thumbGen.makeThumbnails(`./test/${fileName}`)
    await expect(fetchRequest).resolves.toContain(smallThumbFileName)
    await expect(fetchRequest).resolves.toContain(largeThumbFileName)
  })
  test('saveThumb', async () => {
    const thumbPaths = smallThumbFileName
    const uploadRequest = thumbGen.saveThumb(thumbPaths)
    await expect(uploadRequest).resolves.toMatch(
      'https://storage.googleapis.com/munster-setup.appspot.com/'
    )
  })

  test('saveThumbs', async () => {
    const thumbPaths = [smallThumbFileName, largeThumbFileName]
    const uploadRequest = thumbGen.saveThumbs(thumbPaths)
    await expect(uploadRequest).resolves.toHaveLength(2)
  })

  test('createThumbsForProfile', async () => {
    debug(thumbGen.createThumbsForProfile)
    const thumbGenerateRequest = thumbGen.createThumbsForProfile(
      'profilePhotos/recj0EMy3sWHhdove-1523955717393',
      'some-outfile.png'
    )
    await expect(thumbGenerateRequest).resolves.toHaveLength(2)
  }, 10000)
})
