<template>
  <div
    :class="b()"
    @click="onClick"
  >
    <SvgInject :variant="ICON_VARIANTS.add" />
  </div>
</template>

<script>
import SvgInject from '@/components/SvgInject'

import { ICON_VARIANTS, EVENTS } from '@/config'

export default {
  name: 'AddMenu',
  components: {
    SvgInject
  },
  data() {
    return {
      ICON_VARIANTS
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
.AddMenu {
  cursor: pointer;

  position: absolute;
  bottom: 60px;
  right: 30px;

  svg {
    width: 36px;
    height: 36px;
  }
}
</style>
