##############
# MUNSTER
##############
export SLACK_NOTIFY_CALLBACK_URL="TAKEN_FROM_SLACK"
export PROJECT_PATH="INSERT_PATH"

### Firebase
export FIREBASE_APIKEY="some_long_alphanumeric_string_this_long"
export FIREBASE_AUTHDOMAIN="your-projectname.firebaseapp.com"
export FIREBASE_DATABASEURL="https://your-projectname.firebaseio.com"
export FIREBASE_PROJECTID="your-projectname"
export FIREBASE_STORAGEBUCKET="your-projectname.appspot.com"
export FIREBASE_MESSAGINGSENDERID="1234567890123"

# Used for cloud functions and admin scripts
# This assumed you have downloaded a service-account json file at the path below, and named it accordingly
export FIREBASE_SERVICE_ACCOUNT_PATH="$PROJECT_PATH/.envs/service-accounts/$FIREBASE_PROJECTID.service-account.json"

### Airtable

# The user API key used for programatic access.
# Best to grant read-only access to an account, then use that API key
# instead of your own one
export AIRTABLE_API_KEY="keyxxxxxxxxxxxxxx"

# this identifies the airtable database we pull data from
export AIRTABLE_BASE="appzxxxxxxxxxxxxx"

# Google Analytics - optional
export GOOGLE_ANALYTICS_UA="UA-XXXXXXXX-X"

npx firebase use "$FIREBASE_PROJECTID"
npx firebase list

rm -rf "$PROJECT_PATH/.env.local"

cat > "$PROJECT_PATH/.env.local" <<EOT
VUE_APP_FIREBASE_PROJECTID="$FIREBASE_PROJECTID"
VUE_APP_FIREBASE_APIKEY="$FIREBASE_APIKEY"
VUE_APP_FIREBASE_AUTHDOMAIN="$FIREBASE_AUTHDOMAIN"
VUE_APP_FIREBASE_DATABASEURL="$FIREBASE_DATABASEURL"
VUE_APP_FIREBASE_STORAGEBUCKET="$FIREBASE_STORAGEBUCKET"
VUE_APP_FIREBASE_MESSAGINGSENDERID="$FIREBASE_MESSAGINGSENDERID"
VUE_APP_FIREBASE_FUNCTIONSURL="$FIREBASE_FUNCTIONSURL"
VUE_APP_GOOGLE_ANALYTICS_UA="$GOOGLE_ANALYTICS_UA"
EOT
