<template>
  <div class="cf bg-white bg-network mainframe">

    <div>
      <nav-header-logged-in
        class="navnav fixed relative-l"
         />

      <div class="profile-holder fr-ns w-two-thirds-ns w-100-m pa" v-if="profileShowing">
        <profile-detail />
      </div>

      <div class="side-column fl w-100 w-third-ns bt-s bt-m w-100-m bg-white br b--light-gray">
        <the-profile-list />

      </div>
    </div>

  </div>

</template>

<script>
/* eslint-disable */
import NavHeaderLoggedIn from '@/components/shared/NavHeaderLoggedIn.vue'
import ProfileDetail from '@/components/profile/ProfileDetail.vue'
import ProfileSearchItem from '@/components/profile/ProfileSearchItem.vue'
import TheProfileList from '@/components/TheProfileList.vue'

import debugLib from 'debug'
const debug = debugLib('cl8.TheHomePanel')

export default {
  name: 'TheHomePanel',
  components: {
    NavHeaderLoggedIn,
    ProfileDetail,
    TheProfileList
  },

  data() {
    return {}
  },
  computed: {
    profileShowing() {
      return this.$store.getters.profileShowing
    }
  },
  watch: {},
  methods: {},
  created() {
    debug('created')
  }
}
</script>


<style media="screen" lang="scss">
@import '../../node_modules/tachyons/css/tachyons.css';
.side-column, .profile-holder {
  height: calc(100vh - 4.5rem - 1px);
  overflow: auto;
  @media (max-width: 960px){
    margin-top: calc(4.25rem);
    height: calc(100vh - 4.25rem - 1px);
  }
  @media (max-width: 480px){
    margin-top: calc(6.5rem + 1px);
    height: calc(100vh - 6.5rem - 1px);
  }
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
  /* background-image: url(../assets/network-watermark.png); */
  /* background-repeat: no-repeat; */
}

.profile-holder {
  /* box-shadow: 5px 0px 20px #ddd; */
}

button.remove-tag {
  background-image: url(../assets/cross-mark.svg);
  background-size: 0.75em;
  background-repeat: no-repeat;
  background-position: top 0.5em right 0.5em;
  padding-right: 1.5em;
}
</style>
