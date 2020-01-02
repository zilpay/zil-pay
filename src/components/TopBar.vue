<template>
  <div :class="b()">
    <Icon
      :class="b('back-icon')"
      :icon="ICON_VARIANTS.arrowLefrt"
      width="13"
      height="23"
      pointer
    />
    <Title
      :class="b('current-page')"
      :size="SIZE_VARIANS.md"
    >
      {{ currentRouter.name }}
    </Title>
    <Icon
      v-show="isNeedCancelIcon"
      :class="b('cancel-icon')"
      :icon="ICON_VARIANTS.cancel"
      width="23"
      height="23"
      pointer
    />
  </div>
</template>

<script>
import { ICON_VARIANTS, SIZE_VARIANS } from '@/config'

import Icon from '@/components/Icon'
import Title from '@/components/Title'

const _two = 2

/**
 * ToBar is bar for navigate by UI.
 * @example
 * import { ICON_VARIANTS } from '@/config'
 * import TopBar from '@/components/TopBar'
 * <TopBar/>
 */
export default {
  name: 'TopBar',
  components: {
    Icon,
    Title
  },
  data() {
    return {
      SIZE_VARIANS,
      ICON_VARIANTS
    }
  },
  computed: {
    currentRouter() {
      return this.$router.history.current
    },
    isNeedCancelIcon() {
      const { fullPath } = this.currentRouter
      const lengthPath = fullPath.split('/').length

      if (lengthPath > _two) {
        return true
      }

      return false
    }
  }
}
</script>

<style lang="scss">
.TopBar {
  display: grid;

  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;

  min-height: 65px;

  &__back-icon {
    padding-left: 15px;
    justify-self: left;
  }

  &__current-page {
    justify-self: center;
  }

  &__cancel-icon {
    padding-right: 15px;
    justify-self: right;
  }
}
</style>
