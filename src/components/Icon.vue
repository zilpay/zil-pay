<template>
  <img
    v-if="src"
    :class="b({ pointer })"
    :src="src"
    :height="height"
    :width="width"
    @click="onClick"
    @error="onError"
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
    },
    broken: {
      type: String,
      required: false
    }
  },
  computed: {
    src() {
      if (this.type === ICON_TYPE.auto) {
        return this.icon
      }

      return `/icons/${this.icon}.${this.type}`
    }
  },
  methods: {
    onClick() {
      this.$emit(EVENTS.click)
    },
    onError(event) {
      event.srcElement.src = this.broken
    }
  },
  mounted() {
    console.log(this.icon)
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
