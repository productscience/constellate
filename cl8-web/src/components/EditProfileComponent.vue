<template>
  <div class="cf bg-white">
    <nav class="dt w-100 border-box pa3 ph5-ns bb b--black-10 bg-white" v-if="authenticated" >

      <div class="dtc v-mid w-75 tr">
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" title="my profile">my profile</a>
        <a class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns" href="#" @click="logout()" title="log out">log out</a>
      </div>
    </nav>
    <div v-if="authenticated" class="fl w-two-thirds pa2">
      <div class="pa3 center w-80 cf">
        <div>
          <form class="">
            <div class="cf" style="min-height:11em;">
              <div class="fl w-20 ">
                <v-gravatar
                :email="profile.fields.email"
                :size="200"
                class="gravatar b--light-silver ba"
                />


              </div>

              <div class="fl w-50 mt0 pt0">
                <ul class="list mt0 pt0">
                  <li class="list f3 name">{{ profile.fields.Name }}</li>
                  <li class="list f3 email">{{ profile.fields.email }}</li>
                  <li class="list f3 phone">{{ profile.fields.phone }}</li>
                </ul>
              </div>

            </div>

            <div class="cf pt2">
              <label class="typo__label">Skills and interests</label>
              <multiselect v-model="profile.fields.Tags"
                class="pt3 pb3"
                tag-placeholder="Add this as new tag"
                placeholder="Search or add a tag"
                label="Name" track-by="id"
                :options="profileTags"
                :multiple="true" :taggable="true"
                @tag="addTag"></multiselect>
            </div>

            <hr>

            <router-link to="/home"
              v-on:submit.prevent="onSubmit" @click="onSubmit"
              class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green">
              Save these changes
            </router-link>

            <a class="f6 red ml3" href="#">Delete my account</a>

          </form>


        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
/* eslint-disable */

import axios from 'axios'
import { includes, remove, debounce } from 'lodash'

export default {
  name: 'EditProfileComponent',
  props: ['auth', 'authenticated'],
  data () {
    return {
      profile: {
        "createdTime": "2017-11-11T12:40:59.000Z",
        "fields": {
          "Name": "--",
          "Tags": [{
              "Name": "--",
              "id": "--"
            },
            {
              "Name": "--",
              "id": "recoHNloW0Nk9M9JK"
            },
            {
              "Name": "--",
              "id": "recvyDsYcNdJx91is"
            }
          ],
          "email": "--",
          "visible": 'yes'
        },
        "id": "rec0CSbkZBm1wWluF"
      },
      items: [],
      user: JSON.parse(localStorage.getItem('user')),
    }
  },
  components: {
    Multiselect
  },
  methods: {
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
    addTag (newTag) {
      const tag = {
        name: newTag,
        code: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
      }
      this.options.push(tag)
      this.value.push(tag)
    },
    onSubmit: function (item) {
      console.log(item, this.profile)
      this.$emit('profileUpdate', item, this.profile)
      this.$router.push('/home')
    },
    showProfile: function (someThing, childInstance) {
      // console.log('registered click', childInstance)
      let newProfile = this.items.filter(function (peep) {
        return peep.id === childInstance.item.id
      })
      this.profile = newProfile[0]
    }
  },
  watch: {},
  computed: {
    profileTags: function () {
      let tagList = []
      if (this.items.length > 0) {
        this.items.forEach(function (peep) {
          // console.log("Tag:", peep.fields.Tags)
          if (typeof peep.fields.Tags !== 'undefined') {
            peep.fields.Tags.forEach(function (t) {
              let tagListNames = tagList.map(function (tt){
                return tt.Name
              })
              if (!includes(tagListNames, t.Name)) {
                tagList.push(t)
              }
            })
          }
        })
      }
      return tagList
    },
  },
  created () {
    this.fetchPeeps()
    // because fetching the data is asynchronous, we need to update it when
    // the data has been returned
    this.$on('fetchedPeeps', function(listOPeeps) {
        this.items = listOPeeps
        let vm = this
        console.log(vm.user)
        let newProfile = this.items.filter(function (peep) {
          return peep.fields.email === vm.user.email
        })
        this.profile = newProfile[0]
    })

  }
}
</script>


<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style media="screen">
p span.list{
  display: inline-block;
}

</style>
