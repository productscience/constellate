// This bootstraps an constellation with a user and the
// data necessary for them to appear in the app.

const Cl8Importer = require('../src/importer.js');
const setupFbaseAdmin = require('../src/config.js').default
const admin = setupFbaseAdmin()

// Define a user list with objects of the form below, to create an account for
// them, and the corresponding tags in the database
//
// const userlist = [
//   {
//     "fields": {
//       "name": "name",
//       "email": "name@domain.com",
//       "phone": "",
//       "website": "",
//       "twitter": "",
//       "facebook": "",
//       "linkedin": "",
//       "blurb": "",
//       "visible": true,
//       "admin": false,
//       "pitchable": false,
//       "tags": [{
//         "code": "de2251076",
//         "id": "tempvalde2251076",
//         "name": "democracy"
//       }, {
//         "id": "rechxgZtI1UDN4JJP",
//         "name": "environment"
//       }, ]
//     }
//   }]

async function main() {
  const importer = Cl8Importer(admin);
  const importResults = await importer.addUsersAndTags(userlist);
  console.log(importResults);
  process.exitCode = 0;

}
main();
