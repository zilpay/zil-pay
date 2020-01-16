<template>
  <div
    :class="b({ pointer, right })"
    @click="onClick"
  >
    <div
      v-for="(_, index) of Array(2)"
      :key="index"
      :class="b(element, { color, index, right })"
      :style="styles"
    />
  </div>
</template>

<script>
import { EVENTS } from '@/config'

/**
 * Arrow icon.
 * @example
 * import Arrow from '@/components/icons/Arrow'
 * <Arrow
 *   :color="COLOR_VARIANTS.primary"
 *   height="15"
 *   width="2"
 *   right
 * />
 */
export default {
  name: 'Arrow',
  props: {
    width: {
      type: [String, Number],
      default: 4
    },
    height: {
      type: [String, Number],
      default: 20
    },
    pointer: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      required: false
    },
    right: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    styles() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
    },
    element() {
      return this.right ? 'right' : 'left'
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
.Arrow {
  &__left,
  &__right {
    position: relative;
    border-radius: var(--default-border-radius);
    background-color: var(--theme-color-font);

    &_color-primary {
      background-color: var(--accent-color-primary);
    }

    &_color-white {
      background-color: var(--accent-color-white);
    }

    &_color-gray {
      background-color: var(--accent-color-gray);
    }

    &_color-success {
      background-color: var(--accent-color-success);
    }

    &_color-info {
      background-color: var(--accent-color-info);
    }

    &_color-danger {
      background-color: var(--accent-color-danger);
    }

    &_color-warning {
      background-color: var(--accent-color-warning);
    }
  }

  &__left {
    &_index-0 {
      transform: translate(-50%, -20%) rotate(45deg);
    }

    &_index-1 {
      transform: translate(-40%, -58%) rotate(-45deg);
    }
  }

  &__right {
    &_index-0 {
      transform: translate(-50%, -20%) rotate(-45deg);
    }

    &_index-1 {
      transform: translate(-40%, -58%) rotate(45deg);
    }
  }

  &_pointer {
    cursor: pointer;
  }
}
</style>
