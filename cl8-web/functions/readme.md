# Functions

Google cloud functions here exist to help with importing users from airtable.

### Deploying

First, set the google cloud equivalent to env vars:

```
firebase functions:config:set airtable.key="KEYGOESHERE"
firebase functions:config:set airtable.base="BASEGOESHERE"
firebase functions:config:set fbase.path="RELATIVE/PATH/TO/SERVICE_ACCOUNT.JSON"
```

Then deploy the functions

```
firebase deploy --only functions
```
