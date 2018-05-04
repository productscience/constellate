<template>
  <div>

    <div v-if="loading">
      <div class="spinner">
        <img
          src="../assets/loading.svg"
          alt="loading">

      </div>
    </div>

    <div v-else>
      <div class="tag-list ba b--light-silver">
        <p>
          <button
            v-for="tag in activeTags"
            :key="tag"
            class="remove-tag list pa2 ma1 ph3 b--light-silver ba br2 b--white ba br2 bg-dark-blue white relative bg-animate hover-bg-light-blue">
            @click.stop.prevent="toggleTag"
            {{ tag }}
          </button>
        </p>
      </div>

      <ul class="list ml0 pl0">
        <profile-search-item
          v-for="item in searchResults"
          :item="item"
          :key="item.id" />
      </ul>
    </div>

  </div>

</template>

<script>
import { includes } from 'lodash'

import ProfileSearchItem from '@/components/profile/ProfileSearchItem.vue'
import debugLib from 'debug'
const debug = debugLib('cl8.TheProfileList')

const searchKeys = ['fields.name', 'fields.email', 'fields.tags.name']
const searchOptions = {
  keys: searchKeys,
  defaultAll: true,
  threshold: 0.2
}

export default {
  name: 'TheProfileList',
  components: {
    ProfileSearchItem
  },
  data() {
    return {
      loading: true,
      searchResults: []
    }
  },
  computed: {
    term() {
      return this.$store.getters.currentTerm
    },
    activeTags() {
      return this.$store.getters.activeTags
    },
    methodResults() {
      return this.$store.getters.visibleProfileList
    }
  },
  watch: {
    term() {
      this.checkAgainstSearch()
    },
    activeTags() {
      this.checkAgainstSearch()
    }
  },
  created() {
    debug('created')
    this.$store.commit('startLoading')

    // make a new promise to fetch this stuff, then after they have loaded show the stuff
    this.$store
      .dispatch('fetchVisibleProfileList')
      .then(() => {
        debug('loaded the profiles in the component')
        this.searchResults = this.methodResults
        this.$store.commit('stopLoading')
        this.loading = false
      })
      .catch(err => {
        debug("couldn't load in the profile: ", err)
      })
  },

  methods: {
    checkAgainstSearch() {
      debug('checkAgainstSearch: filtering against matching tags:', this.term)
      this.searchResults = this.matchingTags()
      debug('this.searchResults', this.searchResults.length)

      // if we have a term to search against too, after ouer tags
      if (this.term !== '') {
        debug('checkAgainstSearch: searching against term:', this.term)
        this.$search(this.term, this.searchResults, searchOptions).then(
          results => {
            debug('checkAgainstSearch: results', results.length)
            this.searchResults = results
          }
        )
      }
    },
    toggleTag: function(ev) {
      let tag = ev.target.textContent.trim()
      this.$store.dispatch('updateActiveTags', tag)
    },
    matchingTags() {
      let terms = this.activeTags
      debug('matchingTags', terms)
      if (typeof terms === 'undefined' || terms === '') {
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
        return peep.fields.visible === 'yes'
      })
      return visiblePeeps
    }
  }
}
</script>
