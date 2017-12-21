const AirTableWrapper = require('./airtable-wrapper')
const FireBaseWrapper = require('./firebase-auth-wrapper')
const Auth0Wrapper = require('./auth0-wrapper')
const _ = require('lodash')
const debug = require('debug')('importer')


module.exports = Cl8Importer

function Cl8Importer (importerCredentials) {
  const atbl = AirTableWrapper(importerCredentials.airTableCreds[0], importerCredentials.airTableCreds[1])
  const fbase = FireBaseWrapper(importerCredentials.fbaseCreds[0], importerCredentials.fbaseCreds[1] )
  const auth0 = Auth0Wrapper(importerCredentials.auth0Creds[0], importerCredentials.auth0Creds[1])

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
    //     debug('tags', tags.length)
    //     return addRecordtoList(tags, fullTagList)
    //   })
    //   .then(() => {
    //     base(process.env.AIRTABLE_PERSON_NAME_DEV).select().all()
    //   .then(peeps => {
    //     debug('peeps', peeps.length)
    //     addRecordtoList(peeps, peepsList)
    //     return peepsList, fullTagList
    //   })
    //   .then(() => {
    //     debug(peepsList.length, fullTagList.length)
    //     enrichedPeeps = peepsList.map(function(peep) {
    //       return enrichPeep(peep, fullTagList)
    //     })
    //     return enrichedPeeps
    //   })
    //   // THIS CURRENTLY WIPES FIREBASE's DATA
    //   // WE WANT TO ONLY ADD NEW USERS
    //   .then(enrichedPeeps => {
    //     debug("time to write to firebase", enrichedPeeps.length)
    //     return fbAdmin.database().ref('userlist').set(enrichedPeeps)
    //   })
    //   .then(() => {
    //     debug('Synchronization to Firebase succeeded')
    //     debug(enrichedPeeps.length)
    //     return enrichedPeeps
    //   })
    //   .then(enrichedPeeps => {
    //     let firebaseAuthReqs = generateFireBaseAuthPromises(enrichedPeeps)
    //     return executeSequentally(firebaseAuthReqs)
    //   })
    //   .then(() => {
    //     debug(enrichedPeeps.length)
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
    //     debug('all finished')
    //     process.exit()
    //   }).catch(err => {
    //     debug(err)
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
    })
    return executeSequentally(listOfPromises)

  }
  // How would you test this? Is it worth it?
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
    return atbl.getUsers()
    // then fetch the tags
    .then(peeps => {
      return atbl.getTags()
      .then(tags => {
        return { peeps: peeps, tags: tags}
      })
    })
    // then fetch the user list from Firebase RTB so we can make comparisons about them being in the system
    .then(payload => {
      return fbase.getUserList()
      .then(fbUserList => {
        let newPayload = _.cloneDeep(payload)
        newPayload.fbUserList = fbUserList
        return newPayload
      })
    })
    // then then fetch the user list from Firebase Auth
    .then(payload => {
      return fbase.getUsers()
      .then(fbUsers => {
        let newPayload = _.cloneDeep(payload)
        newPayload.fbUsers = fbUsers
        return newPayload
      })
    })
    // // and fetch all the users from Auth0
    .then(payload => {
      return auth0.getUsers()
      .then(auth0Users => {
        let newPayload = _.cloneDeep(payload)
        newPayload.auth0users = auth0Users
        return newPayload
      })
    }).catch(err => {
      debug(err)
      debugger
    })
  }


  function filterOutPeepsToImport (enrichedPeeps, firebaseUserList) {

    function pulloutIds (list) {
      return _.map(_.values(list), (rec) => { return rec.id })
    }

    function pulloutEmails (list) {
      return _.map(_.values(list), (rec) => {
        if (typeof rec.id !== 'undefined') {
          debug(rec.id)
          debug(rec.fields)
          return rec.fields.email
        }
      })
    }

    let enrichedKeys = pulloutEmails(enrichedPeeps)
    let fbUserKeys = pulloutEmails(firebaseUserList.val())
    // debugger

    debug(fbUserKeys.length)
    debug(enrichedKeys.length)

    // let newKeys = _.difference(enrichedKeys, fbUserKeys)

    let keysToImport = _.cloneDeep(enrichedKeys)



    fbUserKeys.forEach(key => {
      _.pull(keysToImport, key)
      // if (keysToImport.indexOf(key) !== -1) {
      //   keysToImport.splice(key, 1)
      // }
    })

    let usersToImport = []
    // once we have the list of ids pull out the
    // debugger
    keysToImport.forEach((key) => {
      let userToImport = enrichedPeeps.filter(peep => {

        return peep.fields.email === key
      })
      // debug(userToImport)
      usersToImport.push(userToImport)
    })

    // debug(usersToImport)
    return usersToImport
  }

  function buildEnrichedPeeps (peepsList, fullTagList) {
    // debug(peepsList)
    // debug(fullTagList)
    let enrichedPeeps = []
    peepsList.forEach(function(peep) {
      // debug("peep", peep)
      let newPeep =  enrichPeep(peep, fullTagList)
      // debug("newpeep", newPeep)
      enrichedPeeps.push(newPeep)
    })
    return enrichedPeeps
  }

  function enrichPeep (peep, tagsList) {
    // debug(peep)
    let enrichedTags = []
    function enrichTag (tagname) {
      return tagsList.filter(function(tag) {
        return tag.id === tagname
      })
    }
    if (typeof peep.fields.tags !== 'undefined'){
      peep.fields.tags = peep.fields.tags.map(function(peepTag) {
        let etag = enrichTag(peepTag)[0]
        // debug(etag)
        return {
          'id': etag.id,
          'name': etag.fields.name
        }
      })
    }
    return peep
  }


  return {
    atbl: atbl,
    fbase: fbase,
    auth0: auth0,
    enrichPeep: enrichPeep,
    buildEnrichedPeeps: buildEnrichedPeeps,
    importUsersAndTags: importUsersAndTags,
    fetchAllDataforSyncing: fetchAllDataforSyncing,
    filterOutPeepsToImport: filterOutPeepsToImport,
    importUsersAcrossServices: importUsersAcrossServices,
  }
}
