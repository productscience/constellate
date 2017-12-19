const Airtable = require('airtable')

const devBase = process.env.AIRTABLE_BASE_DEV
const devkey = process.env.AIRTABLE_API_KEY_DEV
const tagTable = process.env.AIRTABLE_TAG_NAME_DEV
const peepTable = process.env.AIRTABLE_PERSON_NAME_DEV
const base = new Airtable({apiKey: devkey}).base(devBase)

test('it does not return records with empty fields', () => {
  return base(peepTable).select().all()
  .then(records => {
    base(peepTable).select({filterByFormula: "NOT({email} = '')"}).all()
    .then(filteredRecords => {
      return [records, filteredRecords]
    })
    .then(recordPair => {
      let [records, filteredRecords] = recordPair
      console.log("filteredRecords", records.length, 'records', filteredRecords.length)
      expect(records.length).toBeGreaterThan(filteredRecords.length)
    })
  })
})
