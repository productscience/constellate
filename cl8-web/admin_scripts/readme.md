# Admin scripts

If you dont' want to use google cloud functions, you can run these scripts on the command line.

These use the `debug` library, so you can see much more logging be setting the DEBUG variable when running it:

```
DEBUG="cl8*" babel-node clearUsersandDatabase.js
```

#### Running quietly

If you don't want this verbose logging, you can normally like so:

```
babel-node clearUsersandDatabase.js
```

### clearUsersandDatabase.js

This script, whem run will delete all the user accounts, and the accompanying data from the real time database.

Use it to clear an installation before re-importing

### importUsersAndTags.js

This script, when run on the command line fetches data from the corresponding airtable base, and imports it into firebase, so you have a full list of users and tags.

It's designed to allow you to run idempotently, so running the script will not change data the second time if a tag or user has already been imported.
