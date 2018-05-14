<template>
  <div id="tags">
    <input type="text" v-model="input" v-on:keydown.enter="newtag($event, input)" placeholder="add a new tag"/>
    <div id="tagoptions" v-if="sortedOptions">
      <button
        v-for="(option, index) in sortedOptions"
        :key="index"
        v-on:click="toggle($event, option)"
        v-bind:class="{active: checkInList(option)}">
          {{option.name}}
      </button>
    </div>
  </div>
</template>
<script>
import { sortBy } from 'lodash'
// TODO
export default {
  name: 'ProfileTagsComponent',
  props: ['data', 'options'],
  created () {
    if (this.list === undefined ) this.list = []
  },
  computed: {
    list: function () {
      return this.data || []
    },
    sortedOptions: function() {
      return sortBy(this.options, function(x){ return x.name.toLowerCase() })
    }
  },
  data: () => {
    return {
      input: '',
    }
  },
  methods: {
    toggle: function(event, val) {
      event.preventDefault()
      if (this.list !== undefined) {
        if (this.list.find(x => x.name === val.name) === undefined) {
          this.list.push(val)
        } else {
          this.list.splice(this.list.findIndex(x => x.name === val.name), 1)
        }
      } else {
        this.list = [val]
      }
      this.$emit('update:data', this.list)
    },
    newtag: function(event, val) {
      event.preventDefault()
      if (val.length > 0) {
        val = val.toLowerCase().trim()
        if (this.list.find(x => x.name.toLowerCase() === val) === undefined) {
          this.$emit('newtag', val)
        }
      }
    },
    checkInList: function(option){
      if (this.list !== undefined) {
        return this.list.filter(x => x.name === option.name).length > 0
      } else {
        return false
      }

    }
  }
}
</script>
<style scoped lang="scss">
@mixin rounded($r: 5px) {
  -webkit-border-radius: $r;
  -moz-border-radius: $r;
  border-radius: $r;
}
@mixin select() {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
input {
  margin-bottom: 1em;
  width: 100%;
}
#tags {
  $tagbgcolor: #333 !default;
  $tagbgcolorhover: #111 !default;
  $tagtextcolor: #fff !default;
  $deletecolor: #f00 !default;
  $activecolor: green !default;
  button {
    display: inline-block;
    margin: 0 0.5em 0.5em 0;
    background: $tagbgcolor;
    padding: 0.25em 0.5em;
    @include rounded(3px);
    color: $tagtextcolor;
    border: 0;
    cursor: pointer;
    outline: none;
    font-size: 1em;
    @include select();
    &:hover {
      background: $tagbgcolorhover;
      &.tag {
        background: $deletecolor;
      }
    }
    &.notag {
      pointer-events: none;
      font-style: italic;
      opacity: 0.15;
    }
  }

  #tagoptions {
    button {
      opacity: 0.5;
      &.active {
        background: $activecolor !important;
        &:hover {
          background: $deletecolor;
        }
      }
      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
