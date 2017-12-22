const Airtable = require('airtable')

module.exports = AirTableWrapper

function AirTableWrapper (apiKey, apiBase) {
  // console.log(apiKey, apiBase)
  // const base = new Airtable({apiKey: apiKey}).base(apiBase)
  const airtable = new Airtable({apiKey: apiKey}).base(apiBase)

  function fetchRecords (tableName, filterFormula) {
    let results = airtable(tableName)

    if (typeof filterFormula !== 'undefined'){
      return results.select({filterByFormula: filterFormula}).all()
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
    fetchRecords : fetchRecords,
    getUsers: getUsers,
    getTags: getTags,
    airtable: airtable
  }

}
