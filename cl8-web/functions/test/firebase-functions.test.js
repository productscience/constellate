const debug = require('debug')('cl8.local-functions.test')
const functions = require('firebase-functions')

debug('process.env.FIREBASE_CONFIG:', process.env.FIREBASE_CONFIG)

// const parsedFirebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)

const firebaseConfig = {
  databaseURL: 'https://munster-setup.firebaseio.com',
  storageBucket: 'munster-setup.appspot.com',
  projectId: 'munster-setup'
}

console.log('firebaseConfig', firebaseConfig)
console.log('parsedFirebaseConfig', process.env.FIREBASE_CONFIG)

debug('parsed')
debug(firebaseConfig)

const cloudfunctest = require('firebase-functions-test')(
  firebaseConfig,
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
})
