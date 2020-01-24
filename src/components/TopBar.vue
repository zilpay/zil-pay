<template>
  <div :class="b()">
    <div
      :class="b('back-wrapper')"
      @click="goBack"
    >
      <Arrow
        :class="b('back-icon')"
        pointer
      />
      <Title
        v-if="back"
        :size="SIZE_VARIANS.sm"
      >
        back
      </Title>
    </div>
    <Title
      v-show="route"
      :class="b('current-page')"
      :size="SIZE_VARIANS.md"
    >
      {{ currentRouter.name }}
    </Title>
    <Icon
      v-show="close"
      :class="b('cancel-icon')"
      :icon="ICON_VARIANTS.cancel"
      width="23"
      height="23"
      pointer
      @click="onCancel"
    />
  </div>
</template>

<script>
import { ICON_VARIANTS, SIZE_VARIANS, EVENTS } from '@/config'

import Icon from '@/components/Icon'
import Title from '@/components/Title'
import Arrow from '@/components/icons/Arrow'

/**
 * ToBar is bar for navigate by UI.
 * @param route Show current router name.
 * @param close Show close button.
 * @event close When cleck to close button.
 * @example
 * import { ICON_VARIANTS } from '@/config'
 * import TopBar from '@/components/TopBar'
 * <TopBar/>
 */
export default {
  name: 'TopBar',
  components: {
    Icon,
    Title,
    Arrow
  },
  props: {
    route: {
      type: Boolean,
      default: true
    },
    back: {
      type: Boolean,
      required: false
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
  display: grid;

  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;

  min-height: 65px;
  max-width: 600px;

  &__back-wrapper {
    display: grid;
    align-items: center;
    justify-items: center;

    cursor: pointer;
  }

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
