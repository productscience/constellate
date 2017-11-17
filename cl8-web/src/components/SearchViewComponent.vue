<template>
  <ul>
  <li v-for="item in items" :key="item.id" class="peep" :data-atid="item.id">
    <span class="name">{{ item.fields.Name }}</span>
    <span class="email">{{ item.fields.Name }}</span>
    {{ item.fields.email }}
    <ul class='tags'>
      <li v-for="tag in item.fields.Tags">
        {{ tag.Name }},
      </li>
    </ul>
  </li>
</ul>
</template>

<script>



  export default {
    props: ['items'],
    methods: {}
  }
</script>
