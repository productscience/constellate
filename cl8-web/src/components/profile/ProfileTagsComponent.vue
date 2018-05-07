<template>
  <div id="tags">
    <input type="text" v-model="input" v-on:keydown.enter="newtag($event, input)" placeholder="add a new tag"/>
    <div id="tagoptions" v-if="options">
      <button
        v-for="(option, index) in options"
        :key="index"
        v-on:click="toggle($event, option)"
        v-bind:class="{active: list.filter(x => x.name === option.name).length > 0}">
          {{option.name}}
      </button>
    </div>
  </div>
</template>
<script>
// TODO
export default {
  name: 'ProfileTagsComponent',
  props: ['data', 'options'],
  computed: {
    list: function() {
      return this.data
    }
  },
  data: () => {
    return {
      input: ''
    }
  },
  methods: {
    toggle: function(event, val) {
      event.preventDefault()
      if (this.list.find(x => x.name === val.name) === undefined) {
        this.list.push(val)
      } else {
        this.list.splice(this.list.findIndex(x => x.name === val.name), 1)
      }
    },
    newtag: function(event, val) {
      event.preventDefault()
      if (val.length > 0) {
        val = val.toLowerCase().trim()
        if (this.list.find(x => x.name.toLowerCase() === val) === undefined) {
          this.$emit('newtag', val)
        }
      }
    }
    // remove: function (tag) {
    //   this.list.splice(this.list.indexOf(tag), 1)
    //   console.log('LIST:', this.list)
    //   this.update()
    // },
    // update: function () {
    //   let val = ''
    //   if (this.list.indexOf('') > -1) this.list.splice(this.list.indexOf(''), 1)
    //   if (this.list.length > 0) val = this.list.join(',')
    //   this.$emit('update:data', val)
    // }
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
        background: $activecolor;
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
