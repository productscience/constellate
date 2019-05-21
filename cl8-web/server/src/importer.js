'use strict'

const FireBaseWrapper = require('./firebase-wrapper')
const debug = require('debug')('cl8.importer')

module.exports = Cl8Importer
/**
 * Wrapper around the SDK wrapper, to allow us to run imports on the command line,
 * and call import functions from code, in a cloud function
 *
 * @param {Object} admin, firebase-admin instance
 * @returns {Object} with methods to run the import scripts
 */
function Cl8Importer(admin) {
  // const atbl = null
  const fbase = FireBaseWrapper(admin)

  /**
   * Creates Firebase and cl8 accounts for submitted users, skipping users
   * that already exist in Firebase by checking for duplicates by email
   *
   * Returns a list of imported and skipped user records
   *
   *
   * @returns {Object} with keys listing:
   *  a) the imported users, and
   *  b) users already imported previously
   */
  async function addUsersAndTags(userlist) {
    const fbUserList = await fbase.getUserList()

    const knownEmails = fbUserList.map(record => record.fields.email)
    const deduplicated = userlist.filter(
      record => !knownEmails.includes(record.fields.email)
    )

    const importedPeeps = await createAccounts(deduplicated, fbUserList)

    const importedEmails = importedPeeps.map(record => record.account.email)
    const skipped = userlist.filter(
      rec => !importedEmails.includes(rec.fields.email)
    )

    return {
      imported: importedPeeps.map(record => record.data),
      skipped
    }
  }

  /**
   * Takes an array of User objects and a Firebase UserList and adds them to
   * Firebase database, then creates an account for them
   *
   * @param {Array} peepsToImport
   * @param {Array} userList
   * @returns {Array} importedPeeps - an array of newly created user objects
   */
  async function createAccounts(peepsToImport, userList) {
    let importedPeeps = []

    for (let peep of peepsToImport) {
      try {
        const createdUserAccount = await fbase.getOrCreateUser(peep)

        // New Firebase account id assigned to be constellate account id
        peep.id = createdUserAccount.uid

        const createdUser = await fbase.addUserToUserList(peep, userList)
        importedPeeps.push({ data: createdUser, account: createdUserAccount })
      } catch (e) {
        debug('importUsersAcrossServices: error', e)

        // Only throw errors when importing single peeps
        if (peepsToImport.length == 1) {
          throw e
        }
      }

      debug('importedPeeps', importedPeeps)
    }

    return importedPeeps
  }

  return {
    fbase,
    addUsersAndTags
  }
}
