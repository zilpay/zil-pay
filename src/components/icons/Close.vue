<template>
  <div
    :class="b({ pointer, size })"
    @click="onClick"
  />
</template>

<script>
import { SIZE_VARIANS, EVENTS } from '@/config'

export default {
  name: 'Close',
  props: {
    pointer: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: SIZE_VARIANS.xs
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
.Close {
  justify-content: center;
  align-items: center;

  opacity: 0.3;

  &:before, &:after {
    content: ' ';
    position: absolute;
    height: 10px;
    width: 2px;
    background-color: var(--accent-color-black);
  }

  &_pointer {
    cursor: pointer;
  }

  &_size-xs {
    &:before, &:after {
      height: calc(var(--size-xs) - 20px);
    }
  }

  &_size-sm {
    &:before, &:after {
      height: calc(var(--size-sm) - 20px);
    }
  }

  &_size-md {
    &:before, &:after {
      height: calc(var(--size-md) - 30px);
    }
  }

  &_size-lg {
    &:before, &:after {
      height: calc(var(--size-lg) - 30px);
      width: 3px;
    }
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }

  &:hover {
    opacity: 1;
  }
}
</style>
