### Airtable to pull data from

# this identifies the airtable database we pull data from
export AIRTABLE_BASE_PROD="appzxxxxxxxxxxxxx"

# The user API key used for programatic access. 
# Best to grant read-only access to an account, then use that API key
# instead of your own one
export AIRTABLE_API_KEY_PROD="keyxxxxxxxxxxxxxx"

export AIRTABLE_TAG_NAME_PROD="Tags"
export AIRTABLE_PERSON_NAME_PROD="Peeps"

### Firebase 

# Webpack uses these, but we escape them in the config.js files rather than here, so we can access
# them from other sceripts that don't rely on webpack
export FIREBASE_APIKEY_PROD="some_long_alphanumeric_string_this_long"
export FIREBASE_AUTHDOMAIN_PROD="your-projectname.firebaseapp.com"
export FIREBASE_DATABASEURL_PROD="https://your-projectname.firebaseio.com"
export FIREBASE_PROJECTID_PROD="your-projectname"
export FIREBASE_STORAGEBUCKET_PROD="your-projectname.appspot.com"
export FIREBASE_MESSAGINGSENDERID_PROD="1234567890123"

# Used for cloud functions
export FIREBASE_SERVICE_ACCOUNT_PATH_PROD='./service-accounts/your-projectname.service-account.json'

# Optional - 
export GOOGLE_ANALYTICS_UA_PROD="UA-XXXXXXXX-X"
