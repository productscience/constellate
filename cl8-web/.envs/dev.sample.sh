### Airtable to pull data from

# this identifies the airtable database we pull data from
export AIRTABLE_BASE_DEV="appzxxxxxxxxxxxxx"

# The user API key used for programatic access. 
# Best to grant read-only access to an account, then use that API key
# instead of your own one
export AIRTABLE_API_KEY_DEV="keyxxxxxxxxxxxxxx"

export AIRTABLE_TAG_NAME_DEV="Tags"
export AIRTABLE_PERSON_NAME_DEV="Peeps"

### Firebase

# Webpack uses these, but we escape them in the config.js files rather than here, so we can access
# them from other sceripts that don't rely on webpack
export FIREBASE_APIKEY_DEV="some_long_alphanumeric_string_this_long"
export FIREBASE_AUTHDOMAIN_DEV="your-projectname.firebaseapp.com"
export FIREBASE_DATABASEURL_DEV="https://your-projectname.firebaseio.com"
export FIREBASE_PROJECTID_DEV="your-projectname"
export FIREBASE_STORAGEBUCKET_DEV="your-projectname.appspot.com"
export FIREBASE_MESSAGINGSENDERID_DEV="1234567890123"

# Used for cloud functions
export FIREBASE_SERVICE_ACCOUNT_PATH_DEV='./service-accounts/your-projectname.service-account.json'

# Optional - leave as this to run without setting a tracking id
export GOOGLE_ANALYTICS_UA_DEV="UA-XXXXXXXX-X"
