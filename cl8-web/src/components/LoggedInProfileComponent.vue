<template>
  <div class="cf bg-white bg-network">
    <nav class="dt w-100 border-box pa3 ph5-ns bb b--black-10 bg-white" v-if="authenticated" >

      <div class="dtc v-mid w-75 tr">
            <input
              v-model="term" placeholder="search across everything"
              class="input-reset b--black-20 pa2 mr1 w-20"
              name="search-term"
               />
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" @click="myProfile" title="my profile">my profile</a>
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" @click="logout()" title="log out">log out</a>
      </div>
    </nav>

    <div v-if="authenticated" class="fl w-two-thirds pa br b--light-silver profile-holder">

      <profile-component class=""
        v-bind:profile="profile"
        v-bind:fbtagList="fbtagList"
        v-bind:currentUser="currentUser"
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
import ProfileComponent from './ProfileComponent.vue'
import SearchViewComponent from './SearchViewComponent.vue'
import axios from 'axios'
import { includes } from 'lodash'

const searchkeys = ["fields.name", "fields.email", "fields.tags.name"]

export default {
  name: 'LoggedInProfile',
  props: ['auth', 'authenticated', 'logout', 'profile', 'fbase'],
  firebase: function () {
    return {
      fbpeeps: this.fbase.db().ref('userlist'),
    }
  },
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
      user: JSON.parse(localStorage.getItem('user')),
      activetags: [],
      items: [],
      fetchedItems: [],
      fbtagList: [],
      currentUser: false
    }
  },
  components: {
      SearchViewComponent,
      ProfileComponent
  },
  methods: {
    // fbase,
    showProfile: function (someThing, childInstance) {
      // console.log('registered click', childInstance)
      let newProfile = this.items.filter(function (peep) {
        return peep.id === childInstance.item.id
      })
      // console.log(newProfile)
      // this.profile = newProfile[0]
      this.currentUser = this.canEditUser(newProfile[0])
      this.$emit('profileChosen', newProfile[0])
    },
    myProfile: function () {
      let vm = this
      let newProfile = this.items.filter(function (peep) {
        return peep.id === vm.user['https://cl8.io/firebaseId']
      })
      this.currentUser = newProfile[0].id == this.user['https://cl8.io/firebaseId']
      this.$emit('profileChosen', newProfile[0])
    },
    canEditUser: function (newProfile) {
      if (this.user['https://cl8.io/admin'] === true) {
        return true
      }
      return newProfile.id == this.user['https://cl8.io/firebaseId']
    },
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
    },
    items () {
      if (!this.currentUser && this.authenticated){
        this.myProfile()
      }
    },
    authenticated () {
      if (this.authenticated){
        console.log('authenticated')
        this.fbase.authToFireBase(this.user)
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
      return peepsWithTags
    }
  },
  created () {
    let vm = this
    this.$bindAsArray('items', this.$firebaseRefs.fbpeeps)
    this.$bindAsArray('methodResults', this.$firebaseRefs.fbpeeps)

    // when the token is returned update the auth bits
    this.fbase.fbauthNotifier.on('authChange', authedUser => {
      console.log('FB AUTHED WOO: ', authedUser)
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
