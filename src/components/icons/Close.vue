<template>
  <div
    :class="b({ pointer, size, opacity })"
    :style="style"
    @click="onClick"
  />
</template>

<script>
import { SIZE_VARIANS, EVENTS } from '@/config'

export default {
  name: 'Close',
  props: {
    width: {
      type: [String, Number],
      default: 15
    },
    pointer: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: SIZE_VARIANS.xs
    },
    opacity: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    style() {
      return {
        width: `${this.width}px`
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
.Close {
  display: flex;
  justify-content: center;
  align-items: center;

  &:before,
  &:after {
    content: "";
    position: absolute;
    height: 10px;
    background-color: var(--theme-color-font);
    border-radius: var(--default-border-radius);
  }

  &_pointer {
    cursor: pointer;
  }

  &_opacity {
    opacity: 0.3;
  }

  &_size-xs {
    &:before, &:after {
      height: calc(var(--size-xs) - 20px);
    }
  }

  &_size-sm {
    &:before, &:after {
      height: calc(var(--size-sm) - 20px);
      width: 3px;
    }
  }

  &_size-md {
    &:before, &:after {
      height: calc(var(--size-md) - 30px);
      width: 3px;
    }
  }

  &_size-lg {
    &:before, &:after {
      height: calc(var(--size-lg) - 30px);
      width: 4px;
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
