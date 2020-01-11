<template>
  <div
    :class="b({ pointer })"
    :style="style"
    @click="onClick"
  >
    <div
      v-for="(_, index) of Array(3)"
      :key="index"
      :class="b('line', { color })"
    />
  </div>
</template>

<script>
import { EVENTS, COLOR_VARIANTS } from '@/config'

/**
 * Burger Menu.
 * @example
 * import Burger from '@/components/icons/Burger'
 * <Burger pointer width="22" height="30"/>
 */
export default {
  name: 'Burger',
  props: {
    width: {
      type: [String, Number],
      default: 19
    },
    height: {
      type: [String, Number],
      default: 13
    },
    pointer: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: COLOR_VARIANTS.primary
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
.Burger {
  display: grid;
  grid-template-rows: 6px 6px 6px;

  &__line {
    display: block;

    width: 100%;
    height: 2px;

    border-radius: var(--default-border-radius);

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

  &_pointer {
    cursor: pointer;
  }

  :last-child {
    width: 70%;
  }
}
</style>
