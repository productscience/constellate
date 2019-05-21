# Admin scripts

If you dont' want to use google cloud functions, you can run these scripts on the command line.

These use the `debug` library, so you can see much more logging be setting the DEBUG variable when running it:

```
DEBUG="cl8*" node importUsersAndTags.js
```

#### Running quietly

If you don't want this verbose logging, you can normally like so:

```
node importUsersAndTags.js
```

### clearUsersandDatabase.js

This script, when run, will delete all the user accounts, and the accompanying data from the real time database.

Use it to clear an installation before re-importing.
