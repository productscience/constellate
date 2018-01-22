const AirTableWrapper = require('./airtable-wrapper')
const FireBaseWrapper = require('./firebase-auth-wrapper')
const _ = require('lodash')
const debug = require('debug')('cl8.importer')

module.exports = Cl8Importer

function Cl8Importer (importerCredentials) {
  const atbl = AirTableWrapper(importerCredentials.airTableCreds[0], importerCredentials.airTableCreds[1])
  const fbase = FireBaseWrapper(importerCredentials.fbaseCreds[0], importerCredentials.fbaseCreds[1])

  function importUsersAndTags () {
    // once we have all the bits,
    let collectedData = fetchAllDataforSyncing()

    // we can
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

  function deleteUsersAcrossServices (peepsToImport) {
    // // remove users from:
    // let listOfPromises = []
    // _.each(peepsToImport, peep => {

      // firebase
      // let peepRemovedFromFbaseUserList (peep) => {}
      // let peepRemovedFromFbaseUsers = (peep) => {}

      // TODO right now, removing here would clear them from ALL constellations
      // because it there is no real notion of multipl constellations in auth0
      // although we'd could key on the connection id in an auth0 user
      // let peepRemovedFromAuth0 = (peep) => {
      //    return auth0.removeUser(peep.fields.email)
      // }
    // })
  }

  function importUsersAcrossServices (peepsToImport) {
    debug('importing: ', peepsToImport.length)
    let listOfPromises = []
    _.each(peepsToImport, peep => {
      debug(peep.fields)
        // create list of promises here, to then pass into the resolving function
      let userAddedtofbList = () => {
        let userObj = {
          id: peep.id,
          fields: peep.fields
        }
        return fbase.addUserToUserList(userObj)
      }
      let createdfbaseUser = () => {
        return fbase.getOrCreateUser(peep)
      }
      let createdauth0User = () => {
        let params = {
          firebaseUrl: peep.id
        }
        // return auth0.getOrCreateUser(peep.fields.email, params)
      }
      let airtableIDAddedtoAuth0 = () => {
        let params = {
          firebaseUrl: peep.id
        }
        // return auth0.addAirtableAPIToUserByEmail(peep.fields.email, params)
      }
        //
      listOfPromises.push(createdfbaseUser)
      listOfPromises.push(userAddedtofbList)
      listOfPromises.push(createdauth0User)
      listOfPromises.push(airtableIDAddedtoAuth0)
    })
    return executeSequentally(listOfPromises).catch(err => {
      debug(err)
    })
  }
    // How would you test this? Is it worth it?
  function executeSequentally (promises) {
      // accepts a list of promises, and executes them in order, appending
      // each promise to the chain until it's done
    var result = Promise.resolve()
    promises.forEach(function (promiseFactory) {
      result = result.then(promiseFactory)
    })
    return result
  }

  function fetchAllDataforSyncing () {
      // fetch all the airtable records to save all the round generatFireBaseAirTableIdPromises
    return atbl.getUsers()
        // then fetch the tags
        .then(peeps => {
          return atbl.getTags()
            .then(tags => {
              return {
                peeps: peeps,
                tags: tags
              }
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
        }).catch(err => {
          debug(err)
        })
  }

  function filterOutPeepsToImport (enrichedPeeps, firebaseUserList) {
      // accepts a list of airtable user objects, and a firebase database
      // reference, then returns the list of users

    function pulloutEmails (list) {
      return _.map(_.values(list), (rec) => {
        if (typeof rec.id !== 'undefined') {
          debug(rec.id)
          debug(rec.fields)
          return rec.fields.email
        }
      })
    }
      // we call val() to fetch the data, not the function with
    let fbaseUserListData = firebaseUserList.val()
    let fbUserEmails = pulloutEmails(fbaseUserListData)

      // making a clone to avoid changing the original
    let enrichedEmails = pulloutEmails(enrichedPeeps)
    let airtableUserEmails = _.cloneDeep(enrichedEmails)

      // make a lisr of emails that only exist in the airtable list of users
    fbUserEmails.forEach(key => {
      _.pull(airtableUserEmails, key)
    })

      // build the list of users to import based on the email address list
      // we just created
    debug('fbUserEmails', fbUserEmails)
    debug('enrichedEmails', enrichedEmails)
    debug('airtableUserEmails', airtableUserEmails)
    let usersToImport = []
      // once we have the list of ids pull out
    airtableUserEmails.forEach((key) => {
      let userToImport = enrichedPeeps.filter(peep => {
        return peep.fields.email === key
      })
      if (userToImport.length === 1) {
          // debug(userToImport)
        usersToImport.push(userToImport[0])
      }
    })

      // debug(usersToImport)
    return usersToImport
  }

  function buildEnrichedPeeps (peepsList, fullTagList) {
      // debug(peepsList)
      // debug(fullTagList)
    let enrichedPeeps = []
    peepsList.forEach(function (peep) {
        // debug("peep", peep)
      let newPeep = enrichPeep(peep, fullTagList)
        // debug("newpeep", newPeep)
      enrichedPeeps.push(newPeep)
    })
    return enrichedPeeps
  }

  function enrichPeep (peep, tagsList) {
      // debug(peep)
    let enrichedTags = []

    function enrichTag (tagname) {
      return tagsList.filter(function (tag) {
        return tag.id === tagname
      })
    }
    if (typeof peep.fields.tags !== 'undefined') {
      peep.fields.tags = peep.fields.tags.map(function (peepTag) {
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
    enrichPeep: enrichPeep,
    buildEnrichedPeeps: buildEnrichedPeeps,
    importUsersAndTags: importUsersAndTags,
    fetchAllDataforSyncing: fetchAllDataforSyncing,
    filterOutPeepsToImport: filterOutPeepsToImport,
    importUsersAcrossServices: importUsersAcrossServices
  }
}
