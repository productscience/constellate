<template>
  <div>
    <h1>{{ msg }}</h1>

    <search-view-component
      v-for="item in items"
      v-bind:items="items"
      v-bind:key="item.id">
    </search-view-component>
  </div>


</template>

<script>
/* eslint-disable */
import SearchViewComponent from './SearchViewComponent.vue'
// import VueFuse from 'vue-fuse'
//
// Vue.use(VueFuse)


export default {
  name: 'LoggedInProfile',
  data () {
    this
    return {
      msg: 'Sanity checking ',
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
    }
}
</script>
