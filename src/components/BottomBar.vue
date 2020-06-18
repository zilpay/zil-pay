<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <SvgInject :variant="ICON_VARIANTS.home" />
      <SvgInject :variant="ICON_VARIANTS.chip" />
      <SvgInject :variant="ICON_VARIANTS.contact" />
    </div>
  </div>
</template>

<script>
import { ICON_VARIANTS } from '@/config'

import SvgInject from '@/components/SvgInject'

export default {
  name: 'BottomBar',
  components: {
    SvgInject
  },
  data() {
    return {
      ICON_VARIANTS
    }
  }
}
</script>

<style lang="scss">
.BottomBar {
  &__wrapper {
    border-radius: 15px;
    height: 50px;
    background-color: var(--opacity-bg-element-1);
  }
}
</style>
