<template>
  <img
    v-if="src"
    :class="b({ pointer })"
    :src="src"
    :height="height"
    :width="width"
    @click="onClick"
  >
</template>

<script>
import { ICON_TYPE, EVENTS } from '@/config'

/**
 * @example
 * import { ICON_TYPE, ICON_VARIANTS } from '@/config'
 * import Icon from '@/components/Icon'
 * <Icon :icon="ICON_VARIANTS.logo" />
 */
export default {
  name: 'Icon',
  props: {
    icon: {
      type: String,
      required: false
    },
    type: {
      type: String,
      default: ICON_TYPE.svg
    },
    height: {
      type: [Number, String],
      default: 100
    },
    width: {
      type: [Number, String],
      default: 100
    },
    pointer: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    src() {
      if (this.type === ICON_TYPE.auto) {
        if (!this.$attrs.src) {
          throw new Error('Attr src is required')
        }

        return this.$attrs.src
      }

      if (!this.icon && !this.$attrs.src) {
        return null
      }

      return `/icons/${this.icon}.${this.type}`
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
.Icon {
  &_pointer {
    cursor: pointer;
  }
}
</style>
