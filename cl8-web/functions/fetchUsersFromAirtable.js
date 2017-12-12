const Airtable = require('airtable')
const base = new Airtable(
  {apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_API_KEY)

const admin = require('firebase-admin')
const serviceAccount = require('./service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

fullTagList = []
peeps = []

base(process.env.AIRTABLE_TAG_NAME).select({
  // maxRecords: 10
}).eachPage(function page (records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.
  records.forEach(function (record) {
    firebaseRecord = {
      'id': record.id,
      'fields': record.fields,
      'createdTime': record._rawJson.createdTime
    }
    fullTagList.push(firebaseRecord)

  })

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
  fetchNextPage()
}, function done (err) {
  if (err) { console.error(err); return }
  console.log("XXXXXX")
  base(AIRTABLE_PERSON_NAME).select({
    // maxRecords: 10
  }).eachPage(function page (records, fetchNextPage) {
    records.forEach(function (record) {
      firebaseRecord = {
        'id': record.id,
        'fields': record.fields,
        'createdTime': record._rawJson.createdTime
      }
      peeps.push(firebaseRecord)
      // console.log('Retrieved', firebaseRecord)
    })
    fetchNextPage()
  }, function done (err) {
    if (err) { console.error(err); return }

    enrichedPeeps = peeps.map(function(peep) {
      return enrichPeep(peep, fullTagList)
    })

    admin.database().ref('userlist').set(enrichedPeeps).then(function() {
      console.log('Synchronization succeeded');
      return true
    })
    .catch(function(error) {
      console.log('Synchronization failed');
      return false
    })
    return
  })
})

function enrichPeep (peep, tagsList) {
  enrichedTags = []
  function enrichTag (tagname) {
    return tagsList.filter(function(tag) {
      return tag.id === tagname
    })
  }
  if (typeof peep.fields.tags !== 'undefined'){
    peep.fields.tags = peep.fields.tags.map(function(peepTag) {
      let etag = enrichTag(peepTag)[0]
      return {
        'id': etag.id,
        'name': etag.fields.name
      }
    })
  }

  return peep
}
