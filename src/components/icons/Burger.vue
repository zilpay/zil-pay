<template>
  <div
    :class="b({ pointer })"
    :style="style"
    @click="onClick"
  >
    <div
      v-for="(_, index) of Array(3)"
      :key="index"
      :class="b('line')"
    />
  </div>
</template>

<script>
import { EVENTS } from '@/config'

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

    background-color: var(--accent-color-primary);
    border-radius: var(--default-border-radius);
  }

  &_pointer {
    cursor: pointer;
  }

  :last-child {
    width: 70%;
  }
}
</style>
