# Functions

You can use Google cloud functions here exist to run admin type commands that require a server.

### Running locally

you can test these locally without deploying them by opening up a shell, with `npm start`.

npm start

You'll need to set the relevant settings by putting them into `.runtimeconfig.json`. See more in the config

### Deploying

First, set the google cloud equivalent to env vars:

```
firebase functions:config:set fbase.path="RELATIVE/PATH/TO/SERVICE_ACCOUNT.JSON"
```

See more about setting [config variables in the Firebase Cloud function documentation](https://firebase.google.com/docs/functions/config-env)

Then, from within the functions directory, deploy:

```
firebase deploy --only functions
```

You'll be given a url to hit for each function you have exposed in `index.js`
