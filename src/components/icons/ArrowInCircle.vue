<template>
  <svg
    :class="b({ pointer })"
    viewBox="0 0 42 42"
    fill="none"
    @click="onClick"
  >
    <path
      v-for="(d, index) of SVG_CONTENT"
      :key="index"
      :class="b('path')"
      :d="d"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script>
import { EVENTS } from '@/config'

const SVG_CONTENT = [
  'M21 41C32.0457 41 41 32.0457 41 21C41 9.9543 32.0457 1 21 1C9.9543 1 1 9.9543 1 21C1 32.0457 9.9543 41 21 41Z',
  'M24.1588 14.07L30.9645 21L24.1582 27.93',
  'M11 21H30.635'
]

export default {
  name: 'ArrowInCircle',
  props: {
    pointer: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      SVG_CONTENT
    }
  },
  methods: {
    onClick() {
      this.$emit(EVENTS.click)
    }
  }
}
</script>

<style lang="scss">
.ArrowInCircle {
  &__path {
    stroke: var(--theme-color-font);
  }

  &_pointer {
    cursor: pointer;
  }
}
</style>
