<template>
  <li class="list peep" :data-atid="item.id" @click="profileChosen">
    <p class="name">{{ item.fields.Name }}</p>
    <p>{{ item.fields.email }}</p>
  </li>
</template>

<script>
  export default {
    props: ['item'],
    data () {
      return {}
    },
    computed: {},
    methods: {
      profileChosen (someEvent) {
        this.$emit('profileChosen', someEvent, this)
      }
    }
  }
</script>
