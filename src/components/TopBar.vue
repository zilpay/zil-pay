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
    <Close
      v-show="close"
      :class="b('cancel-icon')"
      :size="SIZE_VARIANS.lg"
      pointer
      @click="onCancel"
    />
  </div>
</template>

<script>
import { ICON_VARIANTS, SIZE_VARIANS, EVENTS } from '@/config'

import Title from '@/components/Title'
import Arrow from '@/components/icons/Arrow'
import Close from '@/components/icons/Close'

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
    Arrow,
    Close
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
    display: flex;
    align-items: center;

    text-indent: 10px;

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
