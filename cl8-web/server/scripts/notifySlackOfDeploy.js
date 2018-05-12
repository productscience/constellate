const loadEnv = require('@vue/cli-service/lib/util/loadEnv')

const axios = require('axios')

axios
  .post(
    `https://hooks.slack.com/services/${process.env.SLACK_NOTIFY_CALLBACK_URL}`,
    {
      text: `New deploy for: ${process.env.FIREBASE_PROJECTID} to ${
        process.env.FIREBASE_AUTHDOMAIN
      }`
    }
  )
  .then(function(response) {
    console.log(
      `Notified deploy of ${
        process.env.FIREBASE_PROJECTID
      } to #constellate channel`
    )
  })
  .catch(function(error) {
    console.log(error)
  })
