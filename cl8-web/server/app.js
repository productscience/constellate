const express = require('express')
const app = express()
const port = 3000


const Cl8Importer = require('./src/importer.js')

const firebaseAdmin = require('firebase-admin')
const debug = require('debug')('cl8.importerUsersandTags')

const devBase = process.env.AIRTABLE_BASE
const devKey = process.env.AIRTABLE_APIKEY

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const databaseURL = process.env.FIREBASE_DATABASEURL


app.get('/', async (req, res) => {

  // initialised it here instead of in functions
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  })

  const importerCredentials = {
    airTableCreds: [devKey, devBase],
    fbaseCreds: firebaseAdmin
  }

  console.log("importing!")
  const importer = Cl8Importer(importerCredentials)

  const importResults = await importer.importUsersAndTags()

  res.send(`Imported ${importResults.length} users`)
})

// async function main(){
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
// }


// main()