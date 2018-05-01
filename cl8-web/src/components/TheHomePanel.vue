<template>
  <div class="cf bg-white bg-network">
    
    <div v-if="loading">
      <div class="spinner">
        <img src="../assets/loading.svg" alt="loading"/>
      </div>
    </div> 

    <div v-else>
      <nav-header-logged-in @myProfile="setUserProfile"></nav-header-logged-in>
  
      <div class="profile-holder fl w-two-thirds pa br b--light-silver">
        <profile-detail></profile-detail>
      </div>

      <div class="side-column fl w-third pa2">
    
        <div class="tag-list ba b--light-silver">
          <p>
            <button v-for="tag in activeTags" :key="tag" 
            @click.stop.prevent="toggleTag" 
            class="remove-tag list pa2 ma1 ph3 b--light-silver ba br2 b--white ba br2 bg-dark-blue white relative bg-animate hover-bg-light-blue">
              {{ tag }}
            </button>                  
          </p>
        </div>
    
        <ul class="list ml0 pl0">
          <profile-search-item v-for="item in searchResults" :item="item" :key="item.id"
            @profileChosen="showProfile" />
        </ul>
    
      </div>
    </div>
  
  </div>

</template>

<script>
/* eslint-disable */
import ProfileDetail from '@/components/profile/ProfileDetail.vue'
import ProfileSearchItem from '@/components/profile/ProfileSearchItem.vue'
import NavHeaderLoggedIn from '@/components/shared/NavHeaderLoggedIn.vue'

import { includes } from 'lodash'
import debugLib from 'debug'
import fbase from '@/fbase'

const debug = debugLib('cl8.TheHomePanel')
const searchKeys = ['fields.name', 'fields.email', 'fields.tags.name']
const searchOptions = {
  keys: searchKeys,
  defaultAll: true,
  threshold: 0.2
}

export default {
  name: 'TheHomePanel',
  components: {
    NavHeaderLoggedIn,
    ProfileDetail,
    ProfileSearchItem
  },

  data() {
    return {
      items: [],
      fetchedItems: [],
      tagList: [],
      searchResults: []
    }
  },
  computed: {
    loading() {
      return this.$store.getters.isLoading
    },
    user() {
      return this.$store.getters.currentUser
        ? this.$store.getters.currentUser
        : false
    },
    matchingTags: function() {
      let terms = this.activeTags
      debug('matchingTags', terms)
      if (typeof terms === 'undefined' || terms == '') {
        return this.methodResults
      }
      let matchingPeeps = this.methodResults
      // clear out peeps with NO tags
      let peepsWithFields = matchingPeeps.filter(function(peep) {
        return typeof peep.fields !== 'undefined'
      })
      let peepsWithTags = peepsWithFields.filter(function(peep) {
        return typeof peep.fields.tags !== 'undefined'
      })
      // now reduce the list till we only have people matching all tags
      terms.forEach(function(term) {
        peepsWithTags = peepsWithTags.filter(function(peep) {
          let peepTerms = peep.fields.tags.map(function(tag) {
            return tag.name.toLowerCase()
          })

          return includes(peepTerms, term)
        })
      })
      let visiblePeeps = peepsWithTags.filter(function(peep) {
        return peep.fields.visible == 'yes'
      })
      return visiblePeeps
    },
    term() {
      return this.$store.getters.currentTerm
    },
    activeTags() {
      return this.$store.getters.activeTags
    },
    items() {
      return this.$store.getters.profileList
    },
    methodResults() {
      return this.$store.getters.visibleProfileList
    }
  },
  watch: {
    term() {
      debug('watching term', this.term)
      debug('watching term', typeof this.term)
      if (this.term === '') {
        debug('filtering against matching tags:', this.term)
        this.methodResults = this.matchingTags
      } else {
        debug('searching against term:', this.term)
        this.$search(this.term, this.matchingTags, searchOptions).then(
          results => {
            this.searchResults = results
          }
        )
      }
    },
    activeTags() {
      debug('watching activeTags', this.term)
      if (this.term === '') {
        this.methodResults = this.matchingTags
      } else {
        this.$search(this.term, this.matchingTags, searchOptions).then(
          results => {
            this.methodResults = results
          }
        )
      }
    }
  },
  methods: {
    toggleTag: function(ev) {
      let tag = ev.target.textContent.trim()
      this.$store.dispatch('updateActiveTags', tag)
    },
    setUserProfile() {
      debug('setting own profile for ', this.user)
      let user = this.user
      let matchingProfiles = this.items.filter(function(peep) {
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
  created() {
    this.$store.commit('startLoading')

    // make a new promise to fetch this stuff, then after they have loaded show the stuff
    this.$store
      .dispatch('fetchVisibleProfileList')
      .then(() => {
        debug('loaded the profiles in the component')
        this.$store.commit('stopLoading')
        this.searchResults = this.methodResults
      })
      .catch(err => {
        debug("couldn't load in the component: ", payload, 'failed', error)
      })
  }
}
</script>


<style media="screen">
@import '../../node_modules/tachyons/css/tachyons.css';
.side-column {
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
  content: '\D7';
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
  background-image: url(../assets/network-watermark.png);
  background-repeat: no-repeat;
}

.profile-holder {
  box-shadow: 5px 0px 20px #ddd;
}

button.remove-tag {
  background-image: url(../assets/cross-mark.svg);
  background-size: 0.75em;
  background-repeat: no-repeat;
  background-position: top 0.5em right 0.5em;
  padding-right: 1.5em;
}
</style>
