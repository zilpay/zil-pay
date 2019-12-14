<template>
  <div :class="b({ left, right, })">
    <Icon
      :icon="icon"
      width="10"
      height="18"
      pointer
    />
    <P pointer>
      {{ text }}
    </P>
  </div>
</template>

<script>
import { ICON_VARIANTS } from '@/config'
import Icon from '@/components/Icon'
import P from '@/components/P'

/**
 * ToBar is bar for navigate by UI.
 * @example
 * import { ICON_VARIANTS } from '@/config'
 * import TopBar from '@/components/TopBar'
 * <TopBar left :icon="ICON_VARIANTS.arrowLefrt"/>
 */
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
    Icon,
    P
  }
}
</script>

<style lang="scss">
.TopBar {
  display: grid;
  align-items: center;
  grid-template-columns: 15px 100px;

  padding-left: 24px;
  padding-right: 24px;

  &_left {
    justify-content: left;
  }

  &_right {
    justify-content: right;
  }
}
</style>
