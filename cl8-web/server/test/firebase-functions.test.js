const debug = require('debug')('cl8.local-functions.test')
const functions = require('firebase-functions')

debug('process.env.FIREBASE_CONFIG:', process.env.FIREBASE_CONFIG)

const parsedFirebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)

const cloudfunctest = require('firebase-functions-test')(
  parsedFirebaseConfig,
  './service-account.json'
)

const fbfuncs = require('../index-es6')

describe('profileThumbnailer', async () => {
  test('checkConfig', async () => {
    const wrapped = cloudfunctest.wrap(fbfuncs.checkConfig)
    const objMeta = cloudfunctest.storage.exampleObjectMetadata()

    const funcRes = await wrapped(objMeta)

    expect(funcRes).toHaveProperty('databaseURL')
    expect(funcRes).toHaveProperty('storageBucket')
    expect(funcRes).toHaveProperty('projectId')
  })

  test('generateThumbnail', async () => {
    console.log(cloudfunctest.storage.exampleObjectMetadata ())

    const wrapped = cloudfunctest.wrap(fbfuncs.generateThumbnail)
    const objMeta = cloudfunctest.storage.exampleObjectMetadata()

    const funcRes = await wrapped(objMeta)
  })
})
