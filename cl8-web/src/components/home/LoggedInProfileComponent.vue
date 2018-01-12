<template>
<div class="cf bg-white bg-network">
  <nav-header></nav-header>

  <div class="fl w-two-thirds pa br b--light-silver profile-holder"></div>

  <div class="fl w-third pa2">

    <div class="tag-list ba b--light-silver">
      <p>
        <span v-for="tag in activetags"
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
// import ProfileComponent from '@/components/profile/ProfileComponent.vue'
import SearchViewComponent from './SearchViewComponent.vue'
// import axios from 'axios'
// import { includes } from 'lodash'
import NavHeader from '@/components/Header'
import debugLib from 'debug'
const debug = debugLib('cl8.LoggedInProfileComponent');
import fbase from '@/fbase'

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
    // ProfileComponent
    SearchViewComponent
  },
  firebase: {
    fbpeeps: fbase.database().ref('userlist'),
  },
  data () {
    return {
      activetags: ['taggo'],
      items: [],
      fetchedItems: [],
      tagList: [],
      term: ""
    }
  },
  computed: {
    user() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser : false
    },
    matchingTags: function () {
      return this.items
    },
    term () {
      let vm = this
      if (this.term === ""){
        this.methodResults = this.matchingTags
      } else {
        this.$search(this.term, this.matchingTags, searchOptions).then(results => {
          this.methodResults = results
        })
      }
    },

  },
  methods: {
    showProfile: function () {
      debug('ShowProfile')
    },
    updateActiveTags: function (triggeredTerm) {
      if (this.activetags.indexOf(triggeredTerm) !== -1) {
        let index = this.activetags.indexOf(triggeredTerm)
        this.activetags.splice(index, 1)
      } else {
        this.activetags.push(triggeredTerm)
      }
    },
    toggleTag: function (ev) {
      let tagToToggle = ev.target.textContent.trim()
      this.updateActiveTags(tagToToggle)
    }
  },
  created () {
    this.$bindAsArray('items', this.$firebaseRefs.fbpeeps)
    this.$bindAsArray('methodResults', this.$firebaseRefs.fbpeeps)
  }
}
</script>


<style media="screen">
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
