<template>
  <div :class="b()">
    <router-link
      :class="b('net')"
      :to="{ name: LINKS.networkPage }"
    >
      <SvgInject :variant="ICON_VARIANTS.net"/>
      <P>
        {{ network }}
      </P>
    </router-link>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import settingsStore from '@/store/settings'

import { ICON_VARIANTS } from '@/config'

import NetworkPage from '@/pages/settings/Networks'

import SvgInject from '@/components/SvgInject'
import P from '@/components/P'

export default {
  name: 'Top',
  components: {
    SvgInject,
    P
  },
  data() {
    return {
      ICON_VARIANTS,
      LINKS: {
        networkPage: NetworkPage.name
      }
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.network
    ])
  }
}
</script>

<style lang="scss">
.Top {
  display: flex;
  align-items: center;
  padding-left: 20px;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  height: 33px;

  background-color: var(--accent-color-dark);

  &__net {
    display: flex;
    align-items: center;

    svg {
      margin-right: 5px;
    }
  }
}
</style>
