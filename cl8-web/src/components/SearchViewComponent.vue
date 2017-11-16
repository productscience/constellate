<template>
  <ul>
  <li v-for="item in items" :key="item.id" class="" :data-atid="item.id">
    {{ item.id }}
    {{ item.fields.Name }}
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
    props: ['items']
  }
</script>
