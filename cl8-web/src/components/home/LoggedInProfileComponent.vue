<template>
  <div class="cf bg-white bg-network">
    <h1>LOGGED IN!</h1>

  </div>
</template>

<script>
/* eslint-disable */
// import ProfileComponent from '../profile/ProfileComponent.vue'
// import SearchViewComponent from './SearchViewComponent.vue'
// import axios from 'axios'
// import { includes } from 'lodash'

import debugLib from 'debug'
const debug = debugLib('cl8.LoggedInProfileComponent');


// const searchkeys = ["fields.name", "fields.email", "fields.tags.name"]

export default {
  name: 'LoggedInProfile',

}
</script>


<style media="screen">
p span.list{
  display: inline-block;
}
.tag-list{
  cursor: pointer;
}
.tag-list i.remove_icon:after{
  content: "\D7";
  color: white;
}
.tag-list i.remove_icon{
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1em;
  font-style:normal;
}
.bg-network{
  background-image: url(../../assets/network-watermark.png);
  background-repeat: no-repeat;
}
.profile-holder{
  box-shadow: 5px 0px 20px #ddd;
}

</style>
