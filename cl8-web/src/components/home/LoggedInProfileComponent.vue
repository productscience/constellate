<template>
  <div class="cf bg-white bg-network">


    <div class="should-not-need-this" style="display:none;">
    <svg id="some-cross"
    viewBox="0 0 92 93"
    version="1.1" xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
      <path 
        stroke="#red"
        fill="#fff"
        d="M59.2802424,46.3618932 L91.6469505,78.7286013 L78.2119216,92.1636301 L45.8452136,59.796922 L12.8266415,92.8154942 L-0.608387387,79.3804653 L32.4101847,46.3618932 L-0.276931083,13.6747774 L13.1580978,0.23974855 L45.8452136,32.9268644 L77.8804653,0.891612613 L91.3154942,14.3266415 L59.2802424,46.3618932 Z">
      </path>
    </svg>    
    </div>
    


    <div v-if="loading">
      <div class="spinner">
      <img src="../../assets/loading.svg" alt="loading"/>
    </div>
    </div> 
    <div v-else>
    
      <nav-header @myProfile="setUserProfile"></nav-header>
  
      <div class="profile-holder fl w-two-thirds pa br b--light-silver">
        <profile-component></profile-component>
      </div>
      <div class="side-column fl w-third pa2">
    
        <div class="tag-list ba b--light-silver">
          <p>
            <button v-for="tag in activeTags" v-bind:key="tag" @click.stop.prevent="toggleTag" class="remove-tag list pa2 ma1 ph3 b--light-silver ba br2 b--white ba br2 bg-dark-blue white relative bg-animate hover-bg-light-blue">
                <svg>
                  <use xlink:href="#some-cross"></use>
                </svg>
                  
                  

                  {{ tag }}
            </button>                  
          </p>
        </div>
    
        <ul class="list ml0 pl0">
          <search-view-component v-for="item in methodResults" v-bind:item="item" v-bind:key="item.id" v-on:profileChosen="showProfile">
          </search-view-component>
        </ul>
    
      </div>
    </div>
  
  </div>

</div>
</template>

<script>
/* eslint-disable */
import ProfileComponent from '@/components/profile/ProfileComponent.vue'
import SearchViewComponent from './SearchViewComponent.vue'
import { includes } from 'lodash'
import NavHeader from '@/components/Header'
import debugLib from 'debug'
import fbase from '@/fbase'

const debug = debugLib('cl8.LoggedInProfileComponent')
const searchKeys = ["fields.name", "fields.email", "fields.tags.name"]
const searchOptions = {
  keys: searchKeys,
  defaultAll: true,
  threshold: 0.2
}

export default {
  name: 'LoggedInProfile',
  components: {
    NavHeader,
    ProfileComponent,
    SearchViewComponent
  },
  firebase: {
    fbpeeps: {
      source: fbase.database().ref("userlist"),
      readyCallback: function() {
        debug("data retrieved from fbase");
        this.setUserProfile();
        this.loading = false
      }
    }
  },
  data () {
    return {
      loading: true,
      items: [],
      fetchedItems: [],
      tagList: [],
    }
  },
  computed: {
    user() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser : false
    },
    matchingTags: function () {
      let terms = this.activeTags
      if (typeof terms === 'undefined') {
        return this.items
      }
      let matchingPeeps = this.items
      // clear out peeps with NO tags
      let peepsWithFields = matchingPeeps.filter(function (peep) {
        return typeof peep.fields !== 'undefined'
      })
      let peepsWithTags = peepsWithFields.filter(function (peep) {
        return typeof peep.fields.tags !== 'undefined'
      })
      // now reduce the list till we only have people matching all tags
      terms.forEach(function (term) {
        peepsWithTags = peepsWithTags.filter(function (peep) {
          let peepTerms = peep.fields.tags.map(function (tag) {
            return tag.name
          })
          return includes(peepTerms, term)
        })
      })
      let visiblePeeps = peepsWithTags.filter(function(peep) {
        return peep.fields.visible == 'yes'
      })
      return visiblePeeps
    },
    term () {
      return this.$store.getters.currentTerm
    },
    activeTags () {
      return this.$store.getters.activeTags
    }
  },
  watch: {
    term () {
      debug('watching term', this.term)
      if (this.term === ""){
        this.methodResults = this.matchingTags
      } else {
        this.$search(this.term, this.matchingTags, searchOptions).then(results => {
          this.methodResults = results
        })
      }
    },
    activeTags () {
      debug('watching activeTags', this.term)
      if (this.term === ""){
        this.methodResults = this.matchingTags
      } else {
        this.$search(this.term, this.matchingTags, searchOptions).then(results => {
          this.methodResults = results
        })
      }
    }

  },
  methods: {
    toggleTag: function (ev) {
      let tag = ev.target.textContent.trim()
      this.$store.dispatch('updateActiveTags', tag)
    },
    setUserProfile () {
      debug('setting own profile for ', this.user)
      let user = this.user
      let matchingProfiles = this.items.filter(function (peep) {
        return peep.id === user.uid
      })
      if (matchingProfiles.length > 0) {
        debug('We have a match!', matchingProfiles[0])
        this.$store.commit('setProfile', matchingProfiles[0])
      } else {
        debug('No matches', matchingProfiles)
      }
    }
  },
  created () {
    this.$bindAsArray('items', this.$firebaseRefs.fbpeeps)
    this.$bindAsArray('methodResults', this.$firebaseRefs.fbpeeps.orderByChild('fields/visible').equalTo('yes'))

  }
}
</script>


<style media="screen">
.side-column{
  height: 100vh;
  overflow: auto;
}

p span.list {
  display: inline-block;
}

.tag-list span {
  cursor: pointer;
}

.tag-list span i.remove_icon:after {
  content: "\D7";
  color: white;
}

.tag-list span i.remove_icon {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1em;
  font-style: normal;
}

.bg-network {
  background-image: url(../../assets/network-watermark.png);
  background-repeat: no-repeat;
}

.profile-holder {
  box-shadow: 5px 0px 20px #ddd;
}

button.remove-tag {
  background-image: 0.75em;
  background-repeat: no-repeat;
  background-position: top 0.5em right 0.5em;
  padding-right: 0.5em;
}
button svg {
  width: 0.75rem;
  height: 0.75rem;
  float: right;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}
</style>
