const AirTableWrapper = require('./airtable-wrapper')
const FireBaseWrapper = require('./firebase-auth-wrapper')
const _ = require('lodash')
const debug = require('debug')('cl8.importer')

module.exports = Cl8Importer
/**
 * Wrapper around the SDK wrapper, to allow us to run imports on the command line,
 * and call import functions from code, in a cloud function
 *
 * @param {Object} importerCredentials, with keys with credentials
 * for Airtable and Firebase
 * @returns {Object} with methods to run the import scripts
 */
function Cl8Importer (importerCredentials) {
  const atbl = AirTableWrapper(
    importerCredentials.airTableCreds[0],
    importerCredentials.airTableCreds[1]
  )
  const fbase = FireBaseWrapper(
    importerCredentials.fbaseCreds[0],
    importerCredentials.fbaseCreds[1]
  )

  /**
   * Fetches the data from the necessary Airtable and Firebase APIs, builds the
   * data structures to put into Firebase, skipping user who already exist in Firebase
   *
   *
   * @returns {Object} with keys listing:
   *  a) the imported users, and
   *  b) users already imported previously
   */
  async function importUsersAndTags () {
    const collectedData = await fetchAllDataforSyncing()

    const enrichedPeeps = buildEnrichedPeeps(
      collectedData.peeps,
      collectedData.tags
    )

    // 2) find ones who don't already exist in the realtime user list already
    const peepsToImport = await filterOutPeepsToImport(
      enrichedPeeps,
      collectedData.fbUserList
    )

    // 3) import each of the new Peeps:
    // - add them to the Firebase RTB with the airtable ID as the key
    // - add them to Firebase Auth

    const importedPeeps = await importUsersAcrossServices(
      peepsToImport,
      collectedData.fbUserList
    )

    // - TODO update airtable with when they were imported into Firebase

    return {
      imported: importedPeeps,
      skipped: collectedData.fbUserList
    }
  }
  /**
   * Accepts a user, with an id as created in Airtable, and deletes
   * it from Firebase Realtime Database as well as the their account
   *
   * @param {any} userToDelete
   */
  function deleteUserAcrossServices (user) {
    // remove users from:
    // 1. firebase UserList
    // 2. firebase Account
  }

  /**
   * Takes an array of User objects, with an airtable with an ID as created in
   * Airtable, and a Firebase UserList and adds them to Firebase database, then creates an account
   * for them
   *
   * @param {Array} peepsToImport
   * * @param {Array} userList
   * @returns {Array} importedPeeps - an array of newly created user objects
   */
  async function importUsersAcrossServices (peepsToImport, userList) {
    debug('importUsersAcrossServices: importing ', peepsToImport.length)
    let importedPeeps = []

    for (let peep of peepsToImport) {
      debug(`import user: ${peep.id}, ${peep.fields.email}`)
      try {
        debug(`importUsersAcrossServices: calling addUserToUserList`)
        const createdUser = await fbase.addUserToUserList(peep, userList)
        debug(`importUsersAcrossServices: finished addUserToUserList`)

        debug(`importUsersAcrossServices: calling getOrCreateUser`)
        const createdUserAccount = await fbase.getOrCreateUser(peep)
        debug(`importUsersAcrossServices: finished getOrCreateUser`)

        importedPeeps.push({ data: createdUser, account: createdUserAccount })

        debug(
          'importUsersAcrossServices: added user to import array',
          importedPeeps
        )
      } catch (e) {
        debug('importUsersAcrossServices: error')
        debug(e)
      }

      debug('importedPeeps', importedPeeps)
    }

    return importedPeeps
  }

  /**
   * Fetches data from the third party services, and represents them as plain
   * ol' json objects, so we can run checks locally, then make the API calls to
   * import users that need to be imported or updated
   *
   * @returns {Object} with keyed with data structures to represent users from
   * Airtable, and Firebase.
   */
  async function fetchAllDataforSyncing () {
    const tags = await atbl.getTags()
    const peeps = await atbl.getUsers()

    // then fetch the user list from Firebase RTB so we can make
    // comparisons about them being in the system
    const fbUserList = await fbase.getUserList()

    return {
      peeps,
      tags,
      fbUserList
    }
  }
  /**
   * accepts a list of airtable user objects, and a firebase database
   * reference, then returns the list of users
   *
   * @param enrichedPeeps array of Airtable Records / User Objects
   * @param firebaseUserList array of user objects
   * @returns array of users to import
   */
  function filterOutPeepsToImport (enrichedPeeps, firebaseUserList) {
    function pulloutEmails (list) {
      return _.map(_.values(list), rec => {
        // we need to check if rec is undefined, as I think numerically indexes we started with, result
        // can result in one of the calues of list here being `undefined` which crashes the importer
        // are empty, without even ids.
        if (typeof rec !== 'undefined') {
          if (typeof rec.id !== 'undefined') {
            debug(rec.id, rec.fields.email)
            return rec.fields.email
          }
        }
      })
    }

    let fbUserEmails = pulloutEmails(firebaseUserList)

    // making a clone to avoid changing the original
    let enrichedEmails = pulloutEmails(enrichedPeeps)
    let airtableUserEmails = _.cloneDeep(enrichedEmails)

    // make a list of emails that only exist in the airtable list of users
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
    airtableUserEmails.forEach(key => {
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
  /**
   * Takes an array of user objects, and an array of tag objects, and enriches every
   * user object, to replace tag ids with full tag objects
   *
   * @param {any} peepsList
   * @param {any} fullTagList
   * @returns
   */
  function buildEnrichedPeeps (peepsList, fullTagList) {
    if (!peepsList) {
      throw new Error(`No list of users provided - peepsList: ${peepsList}`)
    }
    if (!fullTagList) {
      throw new Error(`No list of tags provided - fullTagList: ${fullTagList}`)
    }

    let enrichedPeeps = []
    peepsList.forEach(function (peep) {
      // debug("peep", peep)
      let newPeep = enrichPeep(peep, fullTagList)
      // debug("newpeep", newPeep)
      enrichedPeeps.push(newPeep)
    })
    return enrichedPeeps
  }
  /**
   * Takes a user object, and a list of tag objects, and enriches the user's list
   * of tags, replacing the ids with full named versions of the tag, so they
   * are human readable
   *
   * @param {Object} peep
   * @param {Array} tagsList
   * @returns {Object} peep with tag objects, instead of just tag ids
   */
  function enrichPeep (peep, tagsList) {
    if (!peep) {
      throw new Error(`No user provided - peep: ${peep}`)
    }
    if (!tagsList) {
      throw new Error(`No list of tags provided - tagsList: ${tagsList}`)
    }

    function enrichTag (tagname) {
      return tagsList.filter(function (tag) {
        return tag.id === tagname
      })
    }

    if (typeof peep.fields.tags !== 'undefined') {
      peep.fields.tags = peep.fields.tags.map(function (peepTag) {
        let etag = enrichTag(peepTag)[0]
        return {
          id: etag.id,
          name: etag.fields.name
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
