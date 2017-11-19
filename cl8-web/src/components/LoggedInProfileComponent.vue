<template>
  <div>
    <div v-if="authenticated" class="fl w-two-thirds pa2">

      <p v-on:click="fetchPeeps">load data</p>

      <profile-component
        v-bind:profile="profile"
        v-on:toggleTag="updateActiveTags">
      </profile-component>

    </div>

      <div class="fl w-third pa2">
        <div class="tag-list">
          <p>Active tags
          <span v-for="tag in activetags">
              {{ tag }}
          </span>
          </p>
          <input v-model="term">
        </div>

        <p>{{ methodResults.length}} matching results</p>

        <search-view-component
          v-for="(item, index) in methodResults"
          v-bind:item="item"
          v-bind:index="index"
          v-bind:key="item.id"
          v-on:profileChosen="showProfile">
        </search-view-component>
      </ul>

      </div>
  </div>
</template>

<script>
/* eslint-disable */
import ProfileComponent from './ProfileComponent.vue'
import SearchViewComponent from './SearchViewComponent.vue'
import axios from 'axios'
import { debounce, includes, remove } from 'lodash'

export default {
  name: 'LoggedInProfile',
  props: ['auth', 'authenticated'],
  data () {

    return {
      term: "",
      options: {
        keys: ['id', "fields.Name", "fields.email"],
        defaultAll: true
      },
      keys: ['id', "fields.Name", "fields.email"],
      componentResults: [],
      methodResults: [],
      profile: {
        "createdTime": "2017-11-11T12:40:59.000Z",
        "fields": {
          "Name": "Homer Simpson",
          "Tags": [{
              "Name": "donuts",
              "id": "rec7BPWAthDqPSOeY"
            },
            {
              "Name": "Duff Beer",
              "id": "recoHNloW0Nk9M9JK"
            },
            {
              "Name": "taverns",
              "id": "recvyDsYcNdJx91is"
            }
          ],
          "email": "homer.simpson@yahoo.com"
        },
        "id": "rec0CSbkZBm1wWluF"
      },
      user: JSON.parse(localStorage.getItem('user')),
      activetags: [],
      items: [],
      fetchedItems: []
    }
  },
  components: {
      SearchViewComponent,
      ProfileComponent
  },
  methods: {
    showProfile: function (someThing, childInstance) {
      // console.log('registered click', childInstance)
      let newProfile = this.items.filter(function (peep) {
        return peep.id === childInstance.item.id
      })
      this.profile = newProfile[0]
    },
    fetchPeeps: debounce(
      function() {
        let vm = this

        axios.get('/static/airtable.response.json')
          .then(function(response) {
            vm.$emit('fetchedPeeps', response.data)
            vm.fetchedItems = response.data
            vm.items = response.data
          })
          .catch(function (error) {
            console.log("HTTP repsonse failed")
            console.log(error)
          })
        },
        // change this to update the debounce figure
        750
    ),
    updateActiveTags: function (triggeredEvent, childInstance) {
      let triggeredTerm = triggeredEvent.target.textContent.trim()
      if (this.activetags.indexOf(triggeredTerm) !== -1) {
        let index = this.activetags.indexOf(triggeredTerm)
        this.activetags.splice(index, 1)
      } else {
        this.activetags.push(triggeredTerm)
      }
    }
  },
  watch: {
    term () {
      let vm = this
      if (this.term === ""){
        this.methodResults = this.matchingTags
      } else {
      this.$search(this.term, this.matchingTags, this.options).then(results => {
        this.methodResults = results
      })
      }
    },
    activetags () {
      if (this.term === ""){
        this.methodResults = this.matchingTags
      } else {
      this.$search(this.term, this.matchingTags, this.options).then(results => {
        this.methodResults = results
      })
      }
    }
  },
  computed: {
    matchingTags: function () {
      let terms = this.activetags
      if (typeof terms === 'undefined') {
        return this.items
      }
      let matchingPeeps = this.items
      // clear out peeps with NO tags
      let peepsWithTags = matchingPeeps.filter(function (peep) {
        return typeof peep.fields.Tags !== 'undefined'
      })
      // now reduce the list till we only have people matching all tags
      terms.forEach(function (term) {
        peepsWithTags = peepsWithTags.filter(function (peep) {
          let peepTerms = peep.fields.Tags.map(function (tag) {
            return tag.Name
          })
          return includes(peepTerms, term)
        })
      })
      return peepsWithTags
    }
  },
  created () {

    this.fetchPeeps()
    // because fetching the data is asynchronous, we need to update it when
    // the data has been returned
    this.$on('fetchedPeeps', function(listOPeeps) {
        this.items = listOPeeps
        this.methodResults = this.items
        let vm = this
        let newProfile = this.items.filter(function (peep) {
          return peep.fields.email === vm.user.email
        })
        this.profile = newProfile[0]
    })
  }
}
</script>
