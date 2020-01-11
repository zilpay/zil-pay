<template>
  <div
    :class="b({ pointer })"
    @click="onClick"
  >
    <div
      v-for="(_, index) of Array(2)"
      :key="index"
      :class="b('mask', { index })"
      :style="styles"
    />
  </div>
</template>

<script>
import { EVENTS } from '@/config'

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
    }
  },
  computed: {
    styles() {
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
.Arrow {
  &__mask {
    position: relative;

    border-radius: var(--default-border-radius);

    background-color: var(--theme-color-font);

    &_index-0 {
      transform: translate(-50%, -20%) rotate(45deg);
    }

    &_index-1 {
      transform: translate(-40%, -58%) rotate(-45deg);
    }
  }

  &_pointer {
    cursor: pointer;
  }
}
</style>
