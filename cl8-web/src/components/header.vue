<template>
<nav class="dt w-100 border-box pa3 ph5-ns bb b--black-10 bg-white">

  <div class="dtc v-mid w-75 tr">
    <input
      v-model="term" placeholder="search across everything"
      class="input-reset b--black-20 pa2 mr1 w-20"
      name="search-term"
       />
    <a href="#"
      class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns"
      @click="myProfile" title="my profile">
      my profile
    </a>
    <a href="#"
      class="link dim dark-gray f6 f5-ns dib mr3 mr4-ns"
      @click="logout()" title="log out">
      log out
  </a>
  </div>
</nav>
</template>

<script>
export default {
  name: 'Header'
}
</script>
