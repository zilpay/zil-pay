<template>
  <div :class="b()">
    <div
      :class="b('back-icon')"
      @click="goBack"
    >
      <SvgInject :variant="ICON_VARIANTS.arrow"/>
    </div>
    <Title
      v-show="route"
      :class="b('current-page')"
      :size="SIZE_VARIANS.md"
    >
      {{ currentRouter.name }}
    </Title>
  </div>
</template>

<script>
import { ICON_VARIANTS, SIZE_VARIANS } from '@/config'

import Title from '@/components/Title'
import SvgInject from '@/components/SvgInject'

/**
 * ToBar is bar for navigate by UI.
 * @param route Show current router name.
 * @example
 * import TopBar from '@/components/TopBar'
 * <TopBar/>
 */
export default {
  name: 'TopBar',
  components: {
    Title,
    SvgInject
  },
  props: {
    route: {
      type: Boolean,
      default: true
    },
    close: {
      type: Boolean,
      default: false
    }
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
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss">
.TopBar {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 60px;

  &__back-icon {
    cursor: pointer;
    position: absolute;
    left: 30px;
  }
}
</style>
