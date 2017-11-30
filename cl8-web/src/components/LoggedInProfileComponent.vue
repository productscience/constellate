<template>
  <div class="cf bg-white bg-network">
    <nav class="dt w-100 border-box pa3 ph5-ns bb b--black-10 bg-white" v-if="authenticated" >

      <div class="dtc v-mid w-75 tr">
            <input
              v-model="term" placeholder="search across everything"
              class="input-reset b--black-20 pa2 mr1 w-20"
              name="search-term"
               />
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" title="my profile">my profile</a>
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" @click="logout()" title="log out">log out</a>
      </div>
    </nav>


    <div v-if="authenticated" class="fl w-two-thirds pa br b--light-silver profile-holder">

      <profile-component class=""
        v-bind:profile="profile"
        v-bind:activetags="activetags"
        v-on:toggleTag="updateActiveTags">
      </profile-component>

    </div>

    <div v-if="authenticated" class="fl w-third pa2">
      <div class="tag-list">
        <p>
          <span v-for="tag in activetags"

                class="list pa2 ma1 ph3 b--light-silver ba br2 b--white ba br2 bg-dark-red white relative"
                >
                {{ tag }}
                <i class="remove_icon bg-animate hover-bg-light-red"
                  @click="toggleTag"></i>

          </span>
        </p>

      </div>

        <p class="ml2">{{ methodResults.length}} matching results</p>

        <ul class="list ml0 pl0">
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

const searchkeys = ["fields.Name", "fields.email", "fields.Tags.Name"]

export default {
  name: 'LoggedInProfile',
  props: ['auth', 'authenticated', 'logout'],
  data () {

    return {
      term: "",
      options: {
        keys: searchkeys,
        defaultAll: true,
        threshold: 0.2
      },
      keys: searchkeys,
      componentResults: [],
      methodResults: [],
      profile: {
        "createdTime": "--",
        "fields": {
          "Name": "--",
          "Tags": [
          ],
          "email": "--",
          "visible": 'yes'
        },
        "id": "--"
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
    updateActiveTags: function (triggeredTerm) {
      if (this.activetags.indexOf(triggeredTerm) !== -1) {
        let index = this.activetags.indexOf(triggeredTerm)
        this.activetags.splice(index, 1)
      } else {
        this.activetags.push(triggeredTerm)
      }
    },
    // this is the same function as in profilecomponent - reuse instead?
    toggleTag: function (triggeredEvent) {
      let tagToToggle = triggeredEvent.target.parentElement.textContent.trim()
      this.updateActiveTags(tagToToggle)
    },
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


    // debugger
    if (!this.authenticated) {
      console.log('not authed')
      return false
    }

    let localStoragePeeps = localStorage.getItem('fetchedPeeps')

    console.log(localStoragePeeps)

    if (this.fetchedItems.length === 0) {
        this.fetchPeeps()
    }

    // because fetching the data is asynchronous, we need to update it when
    // the data has been returned
    this.$on('fetchedPeeps', function(listOPeeps) {
        localStorage.setItem('fetchedPeeps', JSON.stringify(listOPeeps))
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


<style media="screen">
p span.list{
  display: inline-block;
}
.tag-list i.remove_icon:after{
  content: "\D7";
  color: white;
}
.tag-list i.remove_icon{
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1em;
  font-style:normal;
}
.bg-network{
  background-image: url(../assets/network-watermark.png);
  background-repeat: no-repeat;
}
.profile-holder{
  box-shadow: 5px 0px 20px #ddd;
}

</style>
