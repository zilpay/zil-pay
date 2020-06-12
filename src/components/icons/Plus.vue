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

  border: 2px solid var(--accent-color-primary);
  border-radius: 50%;

  padding: 10px;

  transition: all 0.5s linear;

  &:before,
  &:after {
    content: "";
    position: absolute;
    background-color: var(--accent-color-primary);
    border-radius: var(--default-border-radius);

    transition: all 0.5s linear;
  }

  /* Vertical line */
  &:before{
    top: 20%;
    bottom: 20%;
    left: 50%;
    width: 3px;
    height: auto;
    margin-left: -2px;
  }

  /* horizontal line */
  &:after{
    top: 50%;
    left: 20%;
    right: 20%;
    width: auto;
    height: 3px;
    margin-top: -2px;
  }

  &_pointer {
    cursor: pointer;
  }
}
</style>
