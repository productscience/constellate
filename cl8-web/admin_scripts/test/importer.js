const AirtableWrapper = require('airtable-wrapper')
const FireBaseWrapper = require('firebase-auth-wrapper')
const Auth0Wrapper = require('auth0-wrapper')

// declare our instances of these wrappers
const atbl = AirTableWrapper()
const fbase = FireBaseWrapper()
const auth0 = Auth0Wrapper()

module.exports = Cl8Importer

function Cl8Importer ({airtable: atbl, fbase: fbase, auth0: auth0 }) {

  function importUsersAndTags () {
    // once we have all the bits
    let collectedData = fetchAllDataforSyncing()

    // , we can
    // 1) built an nice datastructure each person
    // - buld our datastructure to represent peeps with tags
    let enrichedPeeps = buildEnrichedPeeps(collectedData.peeps, collectedData.tags)


    // 2) find ones who don't already exist in the realtime user list already
    let peepsToImport = filterOutPeepsToImport(enrichedPeeps, collectedData.fbUserList)

    // 3) import each of the new Peeps:
    // - add them to the Firebase RTB with the airtable ID as the key
    // - add them to Firebase Auth
    // - add them to auth0
    // - update airtable with when they were imported into Firebase and Auth0

    let importedPeeps = importUsersAcrossServices(peepsToImport, collectionData)


    return importedPeeps

    // base(process.env.AIRTABLE_TAG_NAME_DEV).select().all()
    //   .then(tags => {
    //     console.log('tags', tags.length)
    //     return addRecordtoList(tags, fullTagList)
    //   })
    //   .then(() => {
    //     base(process.env.AIRTABLE_PERSON_NAME_DEV).select().all()
    //   .then(peeps => {
    //     console.log('peeps', peeps.length)
    //     addRecordtoList(peeps, peepsList)
    //     return peepsList, fullTagList
    //   })
    //   .then(() => {
    //     console.log(peepsList.length, fullTagList.length)
    //     enrichedPeeps = peepsList.map(function(peep) {
    //       return enrichPeep(peep, fullTagList)
    //     })
    //     return enrichedPeeps
    //   })
    //   // THIS CURRENTLY WIPES FIREBASE's DATA
    //   // WE WANT TO ONLY ADD NEW USERS
    //   .then(enrichedPeeps => {
    //     console.log("time to write to firebase", enrichedPeeps.length)
    //     return fbAdmin.database().ref('userlist').set(enrichedPeeps)
    //   })
    //   .then(() => {
    //     console.log('Synchronization to Firebase succeeded')
    //     console.log(enrichedPeeps.length)
    //     return enrichedPeeps
    //   })
    //   .then(enrichedPeeps => {
    //     let firebaseAuthReqs = generateFireBaseAuthPromises(enrichedPeeps)
    //     return executeSequentally(firebaseAuthReqs)
    //   })
    //   .then(() => {
    //     console.log(enrichedPeeps.length)
    //     let auth0Reqs = generateAuth0Promises(enrichedPeeps)
    //     return executeSequentally(auth0Reqs)
    //   })
    //   // we need to add the firebase ids in now
    //   .then(() => {
    //     let auth0Reqs = generatFireBaseAirTableIdPromises(enrichedPeeps)
    //     return executeSequentally(auth0Reqs)
    //   })
    //   //
    //   .then(() => {
    //     console.log('all finished')
    //     process.exit()
    //   }).catch(err => {
    //     console.log(err)
    //     process.exit()
    //   })
    // })
  }

  // TODO CHECK IT WORKS
  function importUsersAcrossServices (peepsToImport) {
    let listOfPromises = []
    _.each(peepsToImport, peep => {

      // create list of promises here, to then pass into the resolving function
      let userAddedtofbList = () => {
        return fbase.addUserToList(peep)
      }
      let createdfbaseUser = () => {
        return fbase.getOrCreateUser(peep)
      }
      let createdauth0User = () => {
        let params = {
          firebaseUrl: peep.id
        }
        return auth0.addAirtableAPIToUserByEmail(peep.fields.email, params)
      }

      listOfPromises.push(createdauth0User)
      listOfPromises.push(createdfbaseUser)
      listOfPromises.push(userAddedtofbList)

    }
    return executeSequentally(listOfPromises)

  }

  function executeSequentally(promises) {
    // accepts a list of promises, and executes them in order, appending
    // each promise to the chain until it's done
    var result = Promise.resolve()
    promises.forEach(function (promiseFactory) {
      result = result.then(promiseFactory);
    });
    return result
  }

  function fetchAllDataforSyncing () {
    // fetch all the airtable records to save all the round generatFireBaseAirTableIdPromises
    atbl.getUsers()
    // then fetch the tags
    .then(atblUsers =>{
      return atbl.getTags()
      .then(tags =>{
        return { peeps: peeps, tags: tags}
      })
    })
    // then fetch the user list from Firebase RTB so we can make comparisons about them being in the system
    .then(peepsAndTags => {
      return fbase.getUserList()
      .then(fbUserList => {
        return { peeps: peeps, tags: tags, fbUserList: fbUserList }
      })
    })
    // then then fetch the user list from Firebase Auth
    .then(payload => {
      return fbase.getUserList()
      .then(fbUserList => {
        return { peeps: peeps, tags: tags, fbUserList: fbUserList, fbUsers: fbUsers }
      })
    })
    // and fetch all the users from Auth0
    .then(payload => {
      return auth0.getUsersList()
      .then(auth0Users => {
        // TODO look into using _.clone here instead from lodash repeating the object creation
        return { peeps: peeps, tags: tags,  fbUserList: fbUserList, fbUsers: fbUsers, auth0user: auth0Users }
      })
    })
  }

  // TODO implement this
  function filterOutPeepsToImport (enrichedPeeps, firebaseUserList) {
    // get list of keys from enrichedpeeps

    // get list of keys from firebaseUserList

    // return users with keys that are only in enrichedPeeps

  }

  // TODO TESTS
  function buildEnrichedPeeps (peepsList, fullTagList) {
    enrichedPeeps = peepsList.map(function(peep) {
      return enrichPeep(peep, fullTagList)
    }
    return enrichedPeeps
  }

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


  return {
    importUsersandTags: importUsersandTags,
    importUsersAcrossServices: importUsersAcrossServices,
    filterOutPeepsToImport: filterOutPeepsToImport
    fetchAllDataforSyncing: fetchAllDataforSyncing,
    enrichPeep: enrichPeep,
    buildEnrichedPeeps: buildEnrichedPeeps,
  }
}
