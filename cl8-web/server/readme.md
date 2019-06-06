# Functions

Some server functionality is implemented in the form of Google Cloud functions.
You can find these functions in the `index.js` file.

### Running locally

You can test some of the functions locally. For this you need to copy the
service account credentials generated for the frontend part of the application
in a file `server/service-account.json`.

Then you can execute:

'''
\$ npm run serve
'''

You'll need to set the relevant settings by putting them into `.runtimeconfig.json`. See more in the config

### Deploying

First, set the google cloud equivalent to env vars:

```
firebase functions:config:set fbase.path="./service-account.json"
```

See more about setting [config variables in the Firebase Cloud function documentation](https://firebase.google.com/docs/functions/config-env)

Then, from within the functions directory, deploy:

```
firebase deploy --only functions
```

You'll be given a url to hit for each function you have exposed in `index.js`
