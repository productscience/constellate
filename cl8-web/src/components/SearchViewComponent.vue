<template>
  <ul>
  <li v-for="item in matchingTags" :key="item.id" class="peep" :data-atid="item.id">
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
  import { remove, includes } from 'lodash'


  export default {
    props: ['items', 'terms'],
    computed: {
      matchingTags: function () {
        let terms = this.terms
        if (typeof terms === 'undefined') {
          return this.items
        }

        let matchingPeeps = this.items

        // clear out peeps with NO tags
        remove(matchingPeeps, function (peep) {
          return typeof peep.fields.Tags === 'undefined'
        })

        // now reduce the list till we only have people matching all tags
        terms.forEach(function (term) {
          remove(matchingPeeps, function (peep) {
            let peepTerms = peep.fields.Tags.map(function (tag) {
                return tag.Name
            })
            // TODO this smells funny :|
            if (includes(peepTerms, term)) { return false } else { return true}
          })
        })
        return matchingPeeps
      }
    },
    methods: {}
  }
</script>
