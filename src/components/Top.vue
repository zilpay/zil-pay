<template>
  <div :class="b()">
    <router-link
      :class="b('net')"
      :to="{ name: LINKS.networkPage }"
    >
      <SvgInject :variant="ICON_VARIANTS.net"/>
      <P :variant="COLOR_VARIANTS.gray">
        {{ network }}
      </P>
    </router-link>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import settingsStore from '@/store/settings'

import { ICON_VARIANTS, COLOR_VARIANTS } from '@/config'

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
      COLOR_VARIANTS,

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


  width: 100%;
  height: 33px;

  max-width: 100vw;

  background-color: var(--accent-color-dark);

  &__net {
    display: flex;
    align-items: center;

    margin-left: 20px;

    svg {
      margin-right: 5px;
    }
  }
}
</style>
