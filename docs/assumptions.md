

Types of user

### anonymous user

 Doesn't see/do jack

### Signed in user

Most common user of platform.

Can browser through tags, do searches, and update own deets. Can invite limited no of people into the network

### Admin

Typically one or more ppl who set up the platform. Did the initial data entry, to list the people.


# Screens

- Home page
  - anonymous
  - signed in

- User detail view
  - with edit rights
  - without edit rights

- Search / browse view
  - start with list of ALL users, paginated in groups of 25
  - add and remove tags _Open Data_ AND _Supply Chain_, not OR
  - Filter within active with search
  - _nice to have_: Save search url to clipboard

- General Content View
  - Just markdown, so you can add terms of service, Code of Conduct, help pages and so on

- Email reset view _not needed if we're using auth0 and passwordless_
  - sign-in confirmed view
  - sign-in not confirmed


# Stack

### Firebase
  - hosting
  - CDN
  - deployment

### Auth0
  - passwordless auth

### API server

It would be great to not need this. We could do so with just Firebase, but we'd be tying ourselves to more proprietary systems.

  - a: handle auth til I work out how to do SPAs properly
  - b: collate data into nicer data structure for working with in the browser
  - c: make sure we have some notion of RBAC

### Airtable

We could replace this with a google spreadsheet, or csv file

  - nicer Admin experience
  - API
