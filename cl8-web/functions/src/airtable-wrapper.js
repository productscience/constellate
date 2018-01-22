const Airtable = require('airtable')

function AirTableWrapper (apiKey, apiBase) {
  const airtable = new Airtable({
    apiKey: apiKey
  }).base(apiBase)

  /**
   * Fetches a full set of records from the table `tablename`.
   * Accepts an optional formula to filter by, as defined on airtables own site:
   *
   * https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference
   *
   *
   * @param {string} tableName
   * @param {any} filterFormula
   * @returns Array of Airtable Records
   */
  function fetchRecords (tableName, filterFormula) {
    let results = airtable(tableName)

    if (typeof filterFormula !== 'undefined') {
      return results
        .select({
          filterByFormula: filterFormula
        })
        .all()
    } else {
      return results.select().all()
    }
  }

  function getTags (filterFormula) {
    return fetchRecords('Tags')
  }

  function getUsers (filterFormula) {
    // return a list, by default filtering out ones with no email
    return fetchRecords('Peeps', "NOT({email} = '')")
  }

  return {
    fetchRecords: fetchRecords,
    getUsers: getUsers,
    getTags: getTags,
    airtable: airtable
  }
}

module.exports = AirTableWrapper
