const ThumbnailGenerator = require('../../functions/src/thumbnail-generator.js')
const debug = require('debug')('cl8.thumbnail-generator.test')
const serviceAccount = require('../service-account.json')
const testData = require('./testdata.json')
const fs = require('fs')

describe('thumbnailGenerator', () => {
  const thumbGen = ThumbnailGenerator(
    { serviceAccount: serviceAccount },
    testData
  )

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
  
    const fetchRequest = thumbGen.makeThumbnails('./test/test_pic.png')
    await expect(fetchRequest).resolves.toContain(
      'thumb_test_pic-36x36.png'
    )
    await expect(fetchRequest).resolves.toContain(
      'thumb_test_pic-200x200.png'
    )
  })
  test('saveThumb', async () => {
    const thumbPaths = 'thumb_test_img_download-36x36.png'
    const uploadRequest = thumbGen.saveThumb(thumbPaths)
    await expect(uploadRequest).resolves.toMatch(
      'https://storage.googleapis.com/munster-setup.appspot.com/'
    )
  })

  test('saveThumbs', async () => {
    const thumbPaths = [
      'thumb_test_img_download-36x36.png',
      'thumb_test_img_download-200x200.png'
    ]
    const uploadRequest = thumbGen.saveThumbs(thumbPaths)
    await expect(uploadRequest).resolves.toHaveLength(2)
  })

  test('createThumbsForProfile', async () => {
    const thumbGenerateRequest = thumbGen.createThumbsForProfile(
      'profilePhotos/recj0EMy3sWHhdove-1523955717393',
      'some-outfile.png'
    )
    await expect(thumbGenerateRequest).resolves.toHaveLength(2)
  })
})
