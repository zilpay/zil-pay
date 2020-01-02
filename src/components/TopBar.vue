<template>
  <div :class="b({ left, right, })">
    <Icon
      :icon="ICON_VARIANTS.arrowLefrt"
      width="10"
      height="18"
      pointer
    />
    <P pointer>
      {{ text }}
    </P>
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
  components: {
    Icon,
    P
  },
  data() {
    return {
      ICON_VARIANTS
    }
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
