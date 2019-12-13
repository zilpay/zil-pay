<template>
  <div :class="b()">
    <Icon
      :icon="icon"
      width="10"
      height="18"
      pointer
    />
  </div>
</template>

<script>
import { ICON_VARIANTS } from '@/config'
import Icon from '@/components/Icon'

export default {
  name: 'TopBar',
  props: {
    left: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: 'Back'
    },
    icon: {
      type: String,
      default: ICON_VARIANTS.arrowLefrt
    }
  },
  components: {
    Icon
  }
}
</script>

<style lang="scss">
.TopBar {
  width: 100%;
}
</style>
