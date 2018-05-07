<template>
  <div class="editprofile cf bg-white">
    <nav class='pa3 ph3 ph4-ns  bb b--light-gray flex items-center'>
        <span class='w-100'>Edit Profile</span>
        <a href="#"
          v-on:submit.prevent="onSubmit" @click="onSubmit"
          class="fr v-btm f6 mr3 link br2 ph3 pv2 dib white bg-gray hover-bg-green">
          Save
        </a>
        <a href="javascript:history.back()"
          class="fr v-btm f6 link br2 ph3 pv2 dib white bg-gray hover-bg-dark-gray">
          cancel
        </a>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'NavHeaderEdit'
}
</script>
