<template>
  <svg
    :class="b({ pointer })"
    viewBox="0 0 44 54"
    @click="onClick"
  >
    <path
      v-for="(el, index) of SVG_CONTENT"
      :key="index"
      :class="b('path', { color })"
      :d="el"
    />
  </svg>
</template>

<script>
/* eslint-disable max-len */
import { EVENTS } from '@/config'

const SVG_CONTENT = [
  'M38 20.113V14.5C38 6.505 30.822 0 22 0C13.178 0 6 6.505 6 14.5V20.113C2.599 20.699 0 23.663 0 27.23V46.772C0 50.757 3.243 54 7.229 54H36.771C40.757 54 44 50.757 44 46.771V27.229C44 23.663 41.401 20.699 38 20.113ZM8 14.5C8 7.607 14.28 2 22 2C29.72 2 36 7.607 36 14.5V20H8V14.5ZM42 46.771C42 49.654 39.654 52 36.771 52H7.229C4.346 52 2 49.654 2 46.771V27.229C2 24.346 4.346 22 7.229 22H36.771C39.654 22 42 24.346 42 27.229V46.771Z',
  'M22 28C19.794 28 18 29.794 18 32V38C18 40.206 19.794 42 22 42C24.206 42 26 40.206 26 38V32C26 29.794 24.206 28 22 28ZM24 38C24 39.103 23.103 40 22 40C20.897 40 20 39.103 20 38V32C20 30.897 20.897 30 22 30C23.103 30 24 30.897 24 32V38Z'
]

export default {
  name: 'Lock',
  props: {
    pointer: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      required: false
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
.Lock {
  &__path {
    fill: var(--theme-color-font);

    &_color-primary {
      fill: var(--accent-color-primary);
    }

    &_color-white {
      fill: var(--accent-color-white);
    }

    &_color-gray {
      fill: var(--accent-color-gray);
    }

    &_color-success {
      fill: var(--accent-color-success);
    }

    &_color-info {
      fill: var(--accent-color-info);
    }

    &_color-danger {
      fill: var(--accent-color-danger);
    }

    &_color-warning {
      fill: var(--accent-color-warning);
    }
  }

  &_pointer {
    cursor: pointer;
  }
}
</style>
