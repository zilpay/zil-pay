<template>
  <div :class="b()">
    <Arrow
      :class="b('back-icon')"
      pointer
      @click="goBack"
    />
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
import { ICON_VARIANTS, SIZE_VARIANS, EVENTS } from '@/config'

import Title from '@/components/Title'
import Arrow from '@/components/icons/Arrow'

/**
 * ToBar is bar for navigate by UI.
 * @param route Show current router name.
 * @param close Show close button.
 * @event close When cleck to close button.
 * @example
 * import TopBar from '@/components/TopBar'
 * <TopBar/>
 */
export default {
  name: 'TopBar',
  components: {
    Title,
    Arrow
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
    },
    onCancel() {
      this.$router.push({ path: '/home' })
      this.$emit(EVENTS.close)
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
  height: 40px;

  &__back-icon {
    position: absolute;
    left: 30px;
  }
}
</style>
