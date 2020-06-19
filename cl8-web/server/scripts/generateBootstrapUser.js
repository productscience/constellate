// This bootstraps an constellation with a user and the
// data necessary for them to appear in the app.

const Cl8Importer = require('../src/importer.js');
const setupFbaseAdmin = require('../src/config.js').default
const admin = setupFbaseAdmin()

const fs = require('fs');
const parse = require('csv-parse');

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

// Function to import from CSV. Requires a file path
const importCsv = (file) => {
  // Declare array to hold all rows
  let data = []

  // Open a file stream to read rows
  fs.createReadStream(file)
      .pipe(
          parse({
            columns: true,
            cast: (value, context) => {
              if (value.length > 0) {
                if (value.toLowerCase() === 'yes') {
                  return true
                } else if (value.toLowerCase() === 'no') {
                  return false
                } else {
                  return value
                }
              } else {
                return null
              }
            },
          })
      )
      .on('data', (csvrow) => {
        data.push(csvrow)
      })
      .on('end', () => {
        data.forEach((user) => {
          // Run cleanups on each individual user
          if (user.tags) {
            fixNested(user)
          }
          clean(user)
        })

        // Return the array
        return data
      })
}

// This is used to apply logic on the nested fields.
const fixNested = (user) => {
  if (user.tags) {
    const tags = user.tags.split(',')
    const tagList = []
    tags.forEach((tag) => {
      const code = Math.random().toString(36).substring(2, 11);
      const id = 'tempval' + code
      tagList.push({
        code: code,
        id: id,
        name: tag
      })
    })
    user.tags = tagList
  }
  if (user.photo) {
    // This can be changed to make an object if we decide to go down that path again
    user.photo = null
  }
}

// Delete any key with null or undefined values
const clean = (obj) => {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
}

async function main() {
  const importer = Cl8Importer(admin);
  const importResults = await importer.addUsersAndTags(userlist);
  console.log(importResults);
  process.exitCode = 0;

}
main();
