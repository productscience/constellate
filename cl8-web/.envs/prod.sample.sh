### Airtable to pull data from
export AIRTABLE_BASE_PROD="appzxxxxxxxxxxxxx"
export AIRTABLE_API_KEY_PROD="keyxxxxxxxxxxxxxx"
export AIRTABLE_TAG_NAME_PROD="Tags"
export AIRTABLE_PERSON_NAME_PROD="Peeps"

### Firebase 

### webpack expects strings to be escaped *twice*
export FIREBASE_APIKEY_PROD="'some_long_alphanumeric_string_this_long'"
export FIREBASE_AUTHDOMAIN_PROD="'your-projectname.firebaseapp.com'"
export FIREBASE_DATABASEURL_PROD="'https://your-projectname.firebaseio.com'"
export FIREBASE_PROJECTID_PROD="'your-projectname'"
export FIREBASE_STORAGEBUCKET_PROD="'your-projectname.appspot.com'"
export FIREBASE_MESSAGINGSENDERID_PROD="'1234567890123'"

# Used for the functions
export FIREBASE_SERVICE_ACCOUNT_PATH_PROD='./service-accounts/your-projectname.service-account.json'

export GOOGLE_ANALYTICS_UA_PROD="'UA-XXXXXXXX-X'"
