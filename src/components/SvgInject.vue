<template>
  <img
    v-bind="$attrs"
    :src="path"
    @load="svgInject($event.target)"
  >
</template>

<script>
import svgInject from '@iconfu/svg-inject'

import { ICON_TYPE } from '@/config'

/**
 * Fetch the svg icon and inject it as html code.
 * @param variant Color variant from config.
 * @param src path to the icon.
 */
export default {
  name: 'SvgInject',
  props: {
    src: {
      type: String,
      required: false
    },
    variant: {
      type: String,
      required: false
    }
  },
  methods: {
    svgInject
  },
  computed: {
    path() {
      if (this.src) {
        return this.src
      }

      return `/icons/${this.variant}.${ICON_TYPE.svg}`
    }
  }
}
</script>
