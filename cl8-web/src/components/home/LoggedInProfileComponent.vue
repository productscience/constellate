<template>
<div class="cf bg-white bg-network">
  <nav-header></nav-header>

  <div class="profile-holder fl w-two-thirds pa br b--light-silver">
    <profile-component></profile-component>
  </div>
  <div class="side-column fl w-third pa2">

    <div class="tag-list ba b--light-silver">
      <p>
        <span v-for="tag in activeTags"
              @click="toggleTag"
              class="list pa2 ma1 ph3 b--light-silver ba br2 b--white ba br2 bg-dark-red white relative bg-animate hover-bg-light-red"
              >
              {{ tag }}
              <i class="remove_icon"></i>
        </span>
      </p>
    </div>

    <ul class="list ml0 pl0">
      <search-view-component
        v-for="item in methodResults"
        v-bind:item="item"
        v-bind:key="item.id"
        v-on:profileChosen="showProfile">
      </search-view-component>
    </ul>

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
      source: fbase.database().ref('userlist'),
      readyCallback: function () {
        debug('data retrieved from fbase')
        this.setUserProfile()
        
      }
    }
  },
  data () {
    return {
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
    this.$bindAsArray('methodResults', this.$firebaseRefs.fbpeeps)

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
</style>
