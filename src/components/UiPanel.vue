<template>
  <div :class="b()">
    <div :class="b('theme')">
      <Icon
        v-show="selectedTheme === themes[1]"
        :icon="ICON_VARIANTS.moon"
        height="40"
        width="40"
        pointer
        @click="setTheme(themes[2])"
      />
      <Icon
        v-show="selectedTheme === themes[2]"
        :icon="ICON_VARIANTS.sun"
        height="40"
        width="40"
        pointer
        @click="setTheme(themes[1])"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'

import { ICON_VARIANTS } from '@/config'

import Icon from '@/components/Icon'

/**
 * Show icons for change theme.
 * @example
 * import UiPanel from '@/components/UiPanel'
 * <UiPanel />
 */
export default {
  name: 'UiPanel',
  components: {
    Icon
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
    ])
  },
  methods: {
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setTheme
    ])
  }
}
</script>

<style lang="scss">
.UiPanel {
  position: absolute;
  top: 15px;
  right: 30px;
}
</style>
