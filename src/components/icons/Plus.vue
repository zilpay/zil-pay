<template>
  <div
    :class="b({ pointer })"
    :style="style"
    @click="onClick"
  />
</template>

<script>
import { EVENTS } from '@/config'

export default {
  name: 'Plus',
  props: {
    pointer: {
      type: Boolean,
      default: true
    },
    width: {
      type: [String, Number],
      default: '16'
    },
    height: {
      type: [String, Number],
      default: '16'
    }
  },
  computed: {
    style() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
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
.Plus {
  position: relative;

  &:before,
  &:after {
    content: "";
    position: absolute;
    background-color: var(--theme-color-font);
    border-radius: var(--default-border-radius);
  }

  /* Vertical line */
  &:before{
    top: 0;
    left: 50%;
    width: 3px;
    height: 100%;
    margin-left: -2px;
  }

  /* horizontal line */
  &:after{
    top: 50%;
    left: 0;
    width: 100%;
    height: 3px;
    margin-top: -2px;
  }

  &_pointer {
    cursor: pointer;
  }
}
</style>
