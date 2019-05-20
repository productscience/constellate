<template>
  <div class="editprofile cf bg-white">
    <nav class="pa3 ph3 ph4-ns bb b--light-gray flex items-center">
      <span class="w-100">Edit profile</span>
      <a
        href="#"
        v-on:submit.prevent="onSubmit"
        @click="onSubmit"
        class="fr v-btm f6 mr3 link br2 ph3 pv2 dib white bg-gray hover-bg-green"
      >Save</a>
      <router-link
        :to="{ name: 'home' }"
        class="fr v-btm f6 link br2 ph3 pv2 dib white bg-gray hover-bg-dark-gray"
      >cancel</router-link>
    </nav>
  </div>
</template>

<script>
import debugLib from "debug";
const debug = debugLib("cl8.NavHeaderEdit");

export default {
  name: "NavHeaderEdit",
  props: ["title"],
  computed: {
    profile() {
      return this.$store.getters.profile;
    }
  },
  methods: {
    onSubmit: function(item) {
      debug("updating profile", this.profile);
      this.$store.dispatch("updateProfile", this.profile);
    }
  }
};
</script>
