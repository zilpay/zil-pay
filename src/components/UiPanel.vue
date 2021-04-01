<template>
  <div :class="b({ arrow })">
    <div
      :class="b('back')"
      @click="goBack"
      v-if="arrow"
    >
      <SvgInject
        :variant="ICON_VARIANTS.arrowLong"
      />
    </div>
    <div
      :class="b('switch')"
      @click="onThemeChanged"
    >
      <Icon
        v-show="selectedTheme === themes[2]"
        :icon="ICON_VARIANTS.sun"
        height="40"
        width="40"
        pointer
      />
      <span />
      <Icon
        v-show="selectedTheme === themes[1] || selectedTheme === themes[0]"
        :icon="ICON_VARIANTS.moon"
        height="40"
        width="40"
        pointer
      />
    </div>
    <div
      v-if="isExpanded"
      :class="b('expand')"
      @click="linksExpand"
    >
      <SvgInject :variant="ICON_VARIANTS.desktop" />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'

import { DEFAULT } from 'config'
import { ICON_VARIANTS } from '@/config'

import Icon from '@/components/Icon'
import SvgInject from '@/components/SvgInject'

import LinkMixin from '@/mixins/links'

const { window } = global
/**
 * Show icons for change theme.
 * @example
 * import UiPanel from '@/components/UiPanel'
 * <UiPanel />
 */
export default {
  name: 'UiPanel',
  mixins: [LinkMixin],
  components: {
    Icon,
    SvgInject
  },
  props: {
    arrow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ICON_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.selectedTheme,
      uiStore.STATE_NAMES.themes
    ]),

    isExpanded() {
      const { innerHeight, innerWidth } = window

      if (innerHeight <= 600 && innerWidth <= DEFAULT.POPUP_WIDTH) {
        return true
      }

      return false
    }
  },
  methods: {
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setTheme
    ]),

    goBack() {
      this.$router.go(-1)
      console.log(this.$router.path)
    },
    onThemeChanged() {
      switch (this.selectedTheme) {
      case this.themes[1]:
        this.setTheme(this.themes[2])
        break
      case this.themes[2]:
        this.setTheme(this.themes[1])
        break
      default:
        this.setTheme(this.themes[2])
        break
      }
    }
  }
}
</script>

<style lang="scss">
.UiPanel {
  display: flex;
  justify-content: space-between;
  width: 100%;

  &__back {
    cursor: pointer;
  }

  &__switch {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border: 1px solid var(--accent-color-primary);
    box-sizing: border-box;
    border-radius: 40px;
    width: 80px;
    height: 35px;

    & > span {
      border-radius: 100%;
      border: 3px solid var(--accent-color-primary);
      padding: 10px;
      margin-left: 5px;
      margin-right: 5px;
    }

    & > img {
      width: 25px;
      height: 25px;

      margin-left: 5px;
      margin-right: 5px;
    }
  }

  &__expand {
    margin-left: 20px;

    cursor: pointer;

    & > svg {
      height: auto;
      width: 38px;
    }
  }
}

header {
  margin: 20px 0;
}
</style>
