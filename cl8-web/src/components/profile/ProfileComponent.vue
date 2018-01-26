<template>
  <div class="pa3 center w-80 cf" v-if="!!profile">

    <div class="cf" style="min-height:11em;">
      <div class="fl w-20">

          <img v-if="hasPhoto()"
            :src="profile.fields.photo[0].thumbnails.large.url"
            class="supplied-photo b--light-silver ba" />

          <v-gravatar v-else
            :email="profile.fields.email"
            :size="200"
            class="gravatar b--light-silver ba" />

          <div v-if="canEdit()">
              <div v-if="isVisible()"
              class="f6 link dim br-pill ph3 pv2 mb2 dib white bg-green w-80 ma2 tc">
                  Visible
              </div>
              <div v-else class="f6 link dim br-pill ph3 pv2 mb2 dib white bg-red w-80 tc ma2">
                Invisible
              </div>
          </div>

      </div>

      <div class="fl w-50 mt0 pt0">
        <ul class="list mt0 pt0">
          <li class="list f3 name">{{ profile.fields.name }}</li>
          <li class="list f3 email">{{ profile.fields.email }}</li>
          <li class="list f3 phone">{{ profile.fields.phone }}</li>
        </ul>

        <ul class="list">
          <li v-if="profile.fields.website" class="list f5 website">
            <a :href="websiteLink">{{ profile.fields.website }}</a>
            </li>
        </ul>

        <ul class="list social-links">
          <li v-if="this.profile.fields.twitter" class="list f5 twitter dib mr1">
            <a :href="twitterLink" >Twitter</a>
            </li>
          <li v-if="this.profile.fields.facebook" class="list f5 linkedin dib mr1">
            <a :href="facebookLink" >Facebook</a>
            </li>
          <li v-if="this.profile.fields.linkedin" class="list f5 twitter dib mr1">
            <a :href="linkedinLink">LinkedIn</a>
            </li>
        </ul>
      </div>
    </div>

  <div class="blurb lh-copy measure-wide">
      <div v-html="blurbOutput"></div>      
    </div>


    <div class="cf pt2">
      <ul class='list tags ml0 pl0'>
        <li
          v-for="tag in profile.fields.tags" v-bind:key="tag.name"
          class="list bg-white pa2 ma1 ph3 b--light-silver ba br2 bg-animate hover-bg-blue hover-white"
          :class="{ 'bg-dark-blue white': isActive(tag.name) }"
          @click="toggleTag">
          {{ tag.name.toLowerCase().trim() }}
        </li>
      </ul>
    </div>

  
    <div v-if="canEdit()">
      <hr>
        <router-link :to="{ name: 'editProfile' }"
          class="f6 link dim br2 ph3 pv2 mb2 dib white bg-green">
          Edit profile
        </router-link>
    </div>

    <div class="referred-by f6 gray">
      <p>Referred to the DGen Constellation by: Gavin Starks</p>
    </div>
    </div>

</div>
</template>

<script>
/* eslint-disable */
import Vue from "vue";
import Gravatar from "vue-gravatar";
import marked from "marked";
import debugLib from "debug";
const debug = debugLib("cl8.ProfileComponent");
Vue.component("v-gravatar", Gravatar);

import linkify from "../../utils";

export default {
  name: "ProfileComponent",
  components: {
    Gravatar
  },
  props: ["auth", "currentUser", "fbtagList"],
  data() {
    return {};
  },
  computed: {
    websiteLink() {
      return this.profile.fields.website
        ? linkify(this.profile.fields.website)
        : null;
    },
    twitterLink() {
      return this.profile.fields.twitter
        ? linkify(this.profile.fields.twitter, "https://twitter.com")
        : null;
    },
    facebookLink() {
      return this.profile.fields.facebook
        ? linkify(this.profile.fields.facebook, "https://facebook.com")
        : null;
    },
    linkedinLink() {
      return this.profile.fields.linkedin
        ? linkify(this.profile.fields.linkedin, "https://linkedin.com/in")
        : null;
    },
    user() {
      return this.$store.getters.currentUser;
    },
    profile() {
      return this.$store.getters.profile;
    },
    activeTags() {
      return this.$store.getters.activeTags;
    },
    blurbOutput() {
      return marked(this.profile.fields.blurb, { sanitize: true });
    }
  },
  methods: {
    canEdit: function() {
      debug("can edit?", this.profile.id, this.user.uid);
      return this.profile.id == this.user.uid;
    },
    toggleTag: function(ev) {
      let tag = ev.target.textContent.trim();
      this.$store.dispatch("updateActiveTags", tag);
    },
    isActive: function(term) {
      if (typeof this.activeTags !== "undefined") {
        let matchesActiveTag = this.activeTags.indexOf(term) !== -1;
        return matchesActiveTag;
      }
    },
    isVisible: function() {
      return this.profile.fields.visible === "yes";
    },
    hasPhoto() {
      // console.log(this)
      if (typeof this.profile.fields === "undefined") {
        return false;
      }
      if (typeof this.profile.fields.photo === "undefined") {
        return false;
      }
      if (this.profile.fields.photo.length > 0) {
        return true;
      }
      // otherwise just return false
      return false;
    }
  }
};
</script>

<style>
ul.tags li.list {
  display: inline-block;
}
img.gravatar {
  box-shadow: 3px 3px 3px #ddd;
}

/* this only shows a border when we have two or more links in a row */
.social-links li + li {
  border-left: 1px solid #000000;
  padding-left: 1em;
}
</style>
