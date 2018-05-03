const fs = require('fs')
const path = require('path')
const ThumbnailGenerator = require('../../functions/src/thumbnail-generator.js')

const testData = require('./testdata.json')
const testUtils = require('./testUtils')()

const admin = testUtils.firebaseAdmin()

const debug = require('debug')('cl8.thumbnail-generator.test')

describe('thumbnailGenerator', () => {
  const fileName = 'test_pic.png'
  const smallThumbFileName = 'thumb_test_pic-36x36.png'
  const largeThumbFileName = 'thumb_test_pic-200x200.png'

  const thumbGen = ThumbnailGenerator(admin, testData)

  debug(thumbGen)

  beforeAll(async () => {
    debug('checking for file existing in cloud storage')
    const uploadExistsReq = await admin
      .storage()
      .bucket()
      .exists('test/test_pic.png')

    if (!uploadExistsReq[0]) {
      const uploadedFile = await admin
        .storage()
        .bucket()
        .upload('test/test_pic.png')
      debug('uploadedFile', uploadedFile)
    }
  })

  afterAll(async () => {
    // clear  up after ourselves
    thumbGen.clearTempDir()
  })

  beforeEach(() => {
    // ;['outfile.png', 'some-outfile.png'].forEach(filePath => {
    //   testUtils.deleteIfPresent(filePath)
    // })
  })

  afterEach(() => {
    thumbGen.clearLocalThumbs(thumbGen.tmpDir)
  })

  test('validateObject', () => {
    debug(thumbGen)
    expect(thumbGen.validateObject()).toBe(true)
  })

  test('fetchImage with nested path', async () => {
    const tmpDownloadPath = path.join(thumbGen.tmpDir, fileName)
    const fetchRequest = thumbGen.fetchImage(fileName, tmpDownloadPath)
    await expect(fetchRequest).resolves.toBe(tmpDownloadPath)
    expect(fs.existsSync(tmpDownloadPath)).toBe(true)
  })

  test('makeThumbnails', async () => {
    await thumbGen.makeThumbnails(`./test/${fileName}`)
    // check our tmp dir has the files
    const tmpDirContents = fs.readdirSync(thumbGen.tmpDir)
    debug(tmpDirContents)
    expect(tmpDirContents).toContain('thumb_test_pic-36x36.png')
    expect(tmpDirContents).toContain('thumb_test_pic-200x200.png')
  })
  test('saveThumb', async () => {
    await thumbGen.makeThumbnails(`./test/${fileName}`)
    const thumbpath = path.join(thumbGen.tmpDir, smallThumbFileName)
    const uploadRequest = await thumbGen.saveThumb(thumbpath)
    expect(uploadRequest).toMatch('https://storage.googleapis.com/')
  })

  test('saveThumbs', async () => {
    const thumbPaths = [smallThumbFileName, largeThumbFileName].map(pth => {
      return path.join(thumbGen.tmpDir, pth)
    })
    await thumbGen.makeThumbnails(`./test/${fileName}`)
    const uploadRequest = await thumbGen.saveThumbs(thumbPaths)
    debug(uploadRequest)
    uploadRequest.forEach(ur => {
      expect(ur).toMatch('https://storage.googleapis.com/')
    })
  })

  test(
    'createThumbsForProfile',
    async () => {
      debug(thumbGen.createThumbsForProfile)
      const thumbGenerateRequest = thumbGen.createThumbsForProfile(
        fileName,
        'some-outfile.png'
      )
      await expect(thumbGenerateRequest).resolves.toHaveLength(2)
    },
    10000
  )
})
