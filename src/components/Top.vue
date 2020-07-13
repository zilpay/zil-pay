<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <router-link
        :class="b('net')"
        :to="{ name: LINKS.networkPage }"
      >
        <SvgInject :variant="ICON_VARIANTS.net"/>
        <P :variant="COLOR_VARIANTS.gray">
          {{ network }}
        </P>
      </router-link>
      <div
        :class="b('lock')"
        @click="onLogout"
      >
        <SvgInject :variant="ICON_VARIANTS.lock" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import settingsStore from '@/store/settings'

import { ICON_VARIANTS, COLOR_VARIANTS } from '@/config'

import NetworkPage from '@/pages/settings/Networks'
import SvgInject from '@/components/SvgInject'
import P from '@/components/P'

import { Background } from '@/services'

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
  },
  methods: {
    onLogout() {
      const bg = new Background()
      bg.logOut()
    }
  }
}
</script>

<style lang="scss">
.Top {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 33px;
  width: inherit;

  background-color: var(--opacity-bg-element-1);

  &__net {
    display: flex;
    align-items: center;

    svg {
      margin-right: 5px;
    }
  }

  &__lock {
    cursor: pointer;
  }

  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: calc(100vw - 40px);
  }
}
</style>
