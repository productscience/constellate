const AirtableWrapper = require('../../functions/src/airtable-wrapper.js')
const debug = require('debug')('cl8.test.airtable.wrapper')

debug('Yes, you can call debug, and see it in output from jest')

const devBase = process.env.AIRTABLE_BASE_TEST
const devkey = process.env.AIRTABLE_API_KEY_TEST
const tagTable = process.env.AIRTABLE_TAG_NAME_TEST
const peepTable = process.env.AIRTABLE_PERSON_NAME_TEST

const atbl = AirtableWrapper(devkey, devBase)

let setupforTest

describe('fetching records', () => {
  test('getUsers', () => {
    return atbl.getUsers().then(records => {
      let record = records[0]
      expect(record).toHaveProperty('id')
      expect(record).toHaveProperty('fields.email')
      expect(record).toHaveProperty('fields.name')
      // expect(record.).toHaveProperty('fields.tags')
    })
  })

  test('getTags', () => {
    return atbl.getTags().then(records => {
      let record = records[0]
      expect(record).toHaveProperty('id')
      expect(record).toHaveProperty('fields.name')
    })
  })
})

describe('returning correct data', () => {
  beforeAll(() => {
    setupforTest = () => {
      return atbl.airtable(peepTable).create({
        name: 'Person with no email',
        tags: [],
        email: '',
        visible: 'yes',
        admin: 'false'
      })
    }
  })

  test(
    'fetchRecords - skips records not matching formula',
    async () => {
      // create a user with no email address
      const personNoEmail = await setupforTest()
      debug('created peep: ', personNoEmail.id)

      const allPeeps = await atbl
        .airtable(peepTable)
        .select()
        .all()
      const filteredPeeps = await atbl.fetchRecords(
        peepTable,
        "NOT({email} = '')"
      )

      debug(
        'allPeeps:',
        allPeeps.length,
        'filteredPeeps:',
        filteredPeeps.length
      )
      expect(allPeeps.length).toBeGreaterThan(filteredPeeps.length)
    },
    10000
  )

  afterAll(async () => {
    // this should absolutely be mocking the API, or using some
    // approach like vcr does (see vcr.js, vcr in ruby land and so on)
    debug('tidying up')

    const testUsers = await atbl.fetchRecords(
      peepTable,
      "SEARCH('Person', {name}) >= 1"
    )
    debug('Found testUsers: ', testUsers.length)

    let deletedUsers = []
    await testUsers.forEach(async u => {
      debug(u.id, u.fields.name)
      try {
        debug('deleting user', u.id)
        const deletedUser = await atbl.airtable(peepTable).destroy(u.id)
        deletedUsers.push(deletedUser)
      } catch (e) {
        debug('error!', e)
      }
    })
    debug('deleted users: ', deletedUsers.length)
  })
})
