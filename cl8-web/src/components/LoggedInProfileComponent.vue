<template>
  <div>
    <h1>{{ msg }}</h1>

    <div v-if="authenticated">
      <h3>Lets show some stuff from Auth0!</h3>

      <img :src="user.picture" alt=""/>
        <li>Auth0 Nickname: {{ user.nickname }}</li>
        <li>Auth0 Name: {{ user.name }}</li>
        <li>Auth0 Email: {{ user.email }}</li>

      <h3>Now show some stuff from Airtable!</h3>
        <search-view-component
          v-for="item in items"
          v-bind:items="items"
          v-bind:key="item.id">
        </search-view-component>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import SearchViewComponent from './SearchViewComponent.vue'

export default {
  name: 'LoggedInProfile',
  props: ['auth', 'authenticated'],
  data () {
    console.log(JSON.parse(localStorage.getItem('user')))
    return {
      msg: 'Sanity checking ',
      user: JSON.parse(localStorage.getItem('user')),
      activetags: [],
      items: [
        {
          "createdTime": "2017-11-11T12:40:59.000Z",
          "fields": {
            "Name": "Chris Adams",
            "Tags": [
              {
                "Name": "policy",
                "id": "rec7BPWAthDqPSOeY"
              },
              {
                "Name": "Leadership",
                "id": "recoHNloW0Nk9M9JK"
              },
              {
                "Name": "tech",
                "id": "recvyDsYcNdJx91is"
              }
            ],
            "email": "chris@productscience.co.uk"
          },
          "id": "rec0CSbkZBm1wWluF"
        },

      ]
    }
  },
  components: {
      SearchViewComponent
  },
  methods: {}
}
</script>
