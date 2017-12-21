const AirtableWrapper = require('../../functions/src/airtable-wrapper.js')


const devBase = process.env.AIRTABLE_BASE_TEST
const devkey = process.env.AIRTABLE_API_KEY_TEST
const tagTable = process.env.AIRTABLE_TAG_NAME_TEST
const peepTable = process.env.AIRTABLE_PERSON_NAME_TEST


const atbl = AirtableWrapper(devkey, devBase)

let setupforTest, tempPeep

describe('fetching records', () => {
  test('getUsers', () => {
    return atbl.getUsers()
      .then(records => {
        let record = records[0]
        expect(record).toHaveProperty('id')
        expect(record).toHaveProperty('fields.email')
        expect(record).toHaveProperty('fields.name')
        expect(record).toHaveProperty('fields.tags')
      })
  })

  test('getTags', () => {
    return atbl.getTags()
      .then(records => {
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
          "name": "Person with no email",
          "tags": [],
          "email": "",
          "visible": "yes",
          "admin": "false"
      })
    }
  })

    test('fetchRecords', () => {

      // create a user with no email address
      return setupforTest()
        .then(peepId => {
          tempPeep = peepId.id
          console.log("created peep: ", peepId.id)
          return atbl.airtable(peepTable).select().all()
            .then(records => {
              atbl.fetchRecords(peepTable, "NOT({email} = '')")
                .then(filteredRecords => {
                  return [records, filteredRecords]
                })
                .then(recordPair => {
                  let [records, filteredRecords] = recordPair
                  // console.log("filteredRecords", records.length, 'records', filteredRecords.length)
                  expect(records.length).toBeGreaterThan(filteredRecords.length)
                })
            })
        })
    }, 10000)

  afterAll(() => {
    return atbl.airtable(peepTable).destroy(tempPeep)
      .then(peep => {
        console.log("destroyed:", peep.id)
      })
  })
})
