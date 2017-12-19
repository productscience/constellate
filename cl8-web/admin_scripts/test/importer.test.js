const Cl8Importer = require('../../functions/src/importer.js')

const devBase = process.env.AIRTABLE_BASE_DEV
const devKey = process.env.AIRTABLE_API_KEY_DEV
const tagTable = process.env.AIRTABLE_TAG_NAME_DEV
const peepTable = process.env.AIRTABLE_PERSON_NAME_DEV

const serviceAccount = require('../' + process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
const databaseURL = process.env.FIREBASE_DATABASE_URL

const auth0Token = process.env.AUTH0_TOKEN
const auth0Domain = process.env.AUTH0_DOMAIN

let importerCredentials = {
  airTableCreds: [devKey, devBase],
  fbaseCreds: [serviceAccount, databaseURL],
  auth0Creds: [auth0Token, auth0Domain]
}

const importer = Cl8Importer(importerCredentials)

describe('helper functions', () => {

  let testUsers, testTags

  beforeEach(() => {

    testUsers = [{
        id: 'recXXXXXXXXXXXXXX',
        fields: {
          email: 'totallynew@domain.com',
          website: "newsite.com",
          tags: ['rec8AoQ0MPMJQxYKK', 'rec0E1cKWxINp13lg']
        },
      },
      {
        id: 'recXXXXXXXXXXXXXY',
        fields: {
          email: 'bloke@anothersite.com',
          website: "anothersite.com",
          tags: ['reclirD17BHglQHns']
        }
      }
    ]

    testTags = [{
        "id": "rec8AoQ0MPMJQxYKK",
        "fields": {
          "name": "Open Data"
        }
      },
      {
        "id": "rec0E1cKWxINp13lg",
        "fields": {
          "name": "Air Quality"
        }

      },
      {
        "id": "reclirD17BHglQHns",
        "fields": {
          "name": "Astrophysics"
        }
      }
    ]

  })

  test('enrichPeep', () => {

    let testUser = testUsers[0]
    expect.assertions(5);
    let enrichedPeep = importer.enrichPeep(testUser, testTags)
    let firstTag = enrichedPeep.fields.tags[0]
    let secondTag = enrichedPeep.fields.tags[1]
    expect(enrichedPeep.fields.tags.length).toBe(2)
    expect(firstTag).toHaveProperty('id', 'rec8AoQ0MPMJQxYKK')
    expect(firstTag).toHaveProperty('name', 'Open Data')
    expect(secondTag).toHaveProperty('id', 'rec0E1cKWxINp13lg')
    expect(secondTag).toHaveProperty('name', 'Air Quality')
  })

  test('buildEnrichedPeeps', () => {
    let enrichedPeeps = importer.buildEnrichedPeeps(testUsers, testTags)
    let tag = enrichedPeeps[0].fields.tags[0]
    expect(enrichedPeeps.length).toBe(2)
    expect(tag).toHaveProperty('id', 'rec8AoQ0MPMJQxYKK')
    expect(tag).toHaveProperty('name', 'Open Data')


  })

})
