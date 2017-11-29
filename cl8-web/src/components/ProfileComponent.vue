<template>
  <div class="pa3 center w-80 cf">

    <div class="cf">
      <div class="fl w-20">
          <v-gravatar
            :email="profile.fields.email"
            :size="200"
            class="gravatar" />

      </div>

      <div class="fl w-50 mt0 pt0">
        <ul class="list mt0 pt0">
          <li class="list f3 name">{{ profile.fields.Name }}</li>
          <li class="list f3 email">{{ profile.fields.email }}</li>
          <li class="list f3 phone">{{ profile.fields.phone }}</li>
        </ul>

        <ul class="list">
          <li class="list f5 website">{{ profile.fields.website }}</li>
        </ul>

        <ul class="list">
          <li class="list f5 twitter dib mr1">
            <a :href="profile.fields.twitter">Twitter</a>
            </li>
            |
          <li class="list f5 linkedin dib mr1">
            <a :href="profile.fields.linkedin">LinkedIn</a>
            </li>
            |
          <li class="list f5 twitter dib mr1">
            <a :href="profile.fields.facebook">Facebook</a>
            </li>
        </ul>

        </ul>

      </div>




    </div>

    <ul class='list tags ml0 pl0'>
      <li
        v-for="tag in profile.fields.Tags"
        class="list bg-white pa2 ma1 ph3 b--light-silver ba br2"
        v-bind:class="{ active: isActive }"
        @click="toggleTag">
        {{ tag.Name }}
      </li>
    </ul>

    <div v-if="ownProfile">
      <hr>
      <p>Is this correct? <router-link to="/edit" class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green">Change this info</router-link></p>


    </div>



    </div>
</div>
</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import Gravatar from 'vue-gravatar'

Vue.component('v-gravatar', Gravatar)

export default {
  name: 'ProfileComponent',
  props: ['auth', 'authenticated', 'profile', 'activetags'],
  data() {
    return {
      ownProfile : true
    }
  },
  components: {
    Gravatar
  },
  methods: {
    toggleTag: function (triggeredEvent) {
      this.$emit('toggleTag', triggeredEvent, this)
      // update appearance by toggling a class
    },
    isActive: function (ev) {
      console.log(ev)
      // console.log(this)
    }

  }
}
</script>

<style>
  ul.tags li.list {
    display:inline-block;
  }
  img.gravatar {
    box-shadow: 3px 3px 3px #ddd;
  }
</style>
