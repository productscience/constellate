const Airtable = require('airtable')

module.exports = AirTableWrapper

function AirTableWrapper (apiKey, apiBase) {
  // console.log(apiKey, apiBase)
  const base = new Airtable({apiKey: apiKey}).base(apiBase)

  function fetchRecords (tableName, filterFormula) {
    return base.select({filterByFormula: filterFormula}).all()
  }

  return {
    fetchRecords : fetchRecords
  }

}
