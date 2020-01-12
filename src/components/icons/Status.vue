<template>
  <svg
    :class="b({ pointer })"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    @click="onClick"
  >
    <path
      v-for="(el, index) of svg"
      :key="index"
      :d="el"
      :class="b('path', { color, index })"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  </svg>
</template>

<script>
/* eslint-disable max-len */
import { EVENTS, COLOR_VARIANTS } from '@/config'

const SVG_CONTENT = {
  circle: [
    'M7.5 15C11.6421 15 15 11.6421 15 7.5C15 3.35786 11.6421 0 7.5 0C3.35786 0 0 3.35786 0 7.5C0 11.6421 3.35786 15 7.5 15Z'
  ],
  loader: [
    'M15 7.5C15 11.6421 11.6421 15 7.5 15C3.35786 15 0 11.6421 0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5ZM12 7.5C12 9.98528 9.98528 12 7.5 12C5.01472 12 3 9.98528 3 7.5C3 5.01472 5.01472 3 7.5 3C9.98528 3 12 5.01472 12 7.5Z',
    'M2.88708 13.414C4.15935 14.4078 5.76054 15 7.50004 15C11.6422 15 15 11.6421 15 7.5C15 3.35786 11.6422 0 7.50004 0C7.50003 0 7.50003 0 7.50003 0V3C7.50003 3 7.50003 3 7.50004 3C9.98532 3 12 5.01472 12 7.5C12 9.98528 9.98532 12 7.50004 12C6.45633 12 5.49562 11.6447 4.73226 11.0484L2.88708 13.414Z'
  ]
}

export default {
  name: 'Status',
  props: {
    pointer: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: COLOR_VARIANTS.success
    },
    loader: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    svg() {
      if (this.loader) {
        return SVG_CONTENT.loader
      }

      return SVG_CONTENT.circle
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
.Status {
  &__path {
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
