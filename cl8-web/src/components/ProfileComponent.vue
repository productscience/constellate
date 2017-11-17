<template>
  <div>
    <div v-if="ownProfile">
      <a href="#">Edit</a>
    </div>

    <ul>
      <li class="list name">{{ profile.fields.Name }}</li>
      <li class="list email">{{ profile.fields.email }}</li>
    </ul>
    <ul class='tags'>
      <li
        v-for="tag in profile.fields.Tags"
        class="list bg-blue pa1 ma1"
        @click="toggleTag">
        {{ tag.Name }}
      </li>
    </ul>


    </div>
</div>
</template>

<script>
/* eslint-disable */

export default {
  name: 'ProfileComponent',
  props: ['auth', 'authenticated', 'profile'],
  data() {
    return {
      ownProfile : true
    }
  },
  components: {},
  methods: {
    toggleTag: function (triggeredEvent) {
      this.$emit('toggleTag', triggeredEvent, this)
      // update appearance by toggling a class
    }
  }
}
</script>

<style>
  ul.tags li.list {
    display:inline-block;
  }
</style>
