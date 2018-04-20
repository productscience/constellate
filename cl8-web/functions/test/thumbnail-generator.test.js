const ThumbnailGenerator = require('../../functions/src/thumbnail-generator.js')
const testData = require('./testdata.json')
const fs = require('fs')
const admin = require('firebase-admin')
const debug = require('debug')('cl8.thumbnail-generator.test')

describe('thumbnailGenerator', () => {
  const fileName = 'test_pic.png'
  const smallThumbFileName = 'thumb_test_pic-36x36.png'
  const largeThumbFileName = 'thumb_test_pic-200x200.png'
  const alreadyUploadedFile = 'profilePhotos/recj0EMy3sWHhdove-1523955717393'
  const projectId = ''

  const serviceAccountPath = process.env.FIREBASE_CONFIG
    ? process.env.FIREBASE_CONFIG
    : '../service-account.json'
  const serviceAccount = require(serviceAccountPath)

  const thumbGen = ThumbnailGenerator(
    { serviceAccount: serviceAccount },
    testData
  )

  debug(thumbGen)

  test('validateObject', () => {
    debug(thumbGen)
    expect(thumbGen.validateObject()).toBe(true)
  })

  test('fetchImage with nested path', async () => {
    if (fs.existsSync('outfile.png')) {
      fs.unlinkSync('outfile.png')
    }

    const fetchRequest = thumbGen.fetchImage(alreadyUploadedFile, 'outfile.png')
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
      'https://storage.googleapis.com/'
    )
  })

  test('saveThumbs', async () => {
    const thumbPaths = [smallThumbFileName, largeThumbFileName]
    const uploadRequest = thumbGen.saveThumbs(thumbPaths)
    await expect(uploadRequest).resolves.toHaveLength(2)
  })

  test(
    'createThumbsForProfile',
    async () => {
      debug(thumbGen.createThumbsForProfile)
      const thumbGenerateRequest = thumbGen.createThumbsForProfile(
        alreadyUploadedFile,
        'some-outfile.png'
      )
      await expect(thumbGenerateRequest).resolves.toHaveLength(2)
    },
    10000
  )
})
