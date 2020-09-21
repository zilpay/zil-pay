<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <router-link
        :class="b('net', { main: network === mainnet })"
        :to="{ name: LINKS.networkPage }"
      >
        <SvgInject :variant="ICON_VARIANTS.net"/>
        <P>
          {{ network }}
        </P>
      </router-link>
      <div
        v-show="!hiden"
        :class="b('icons')"
      >
        <div @click="onLogout">
          <SvgInject :variant="ICON_VARIANTS.lock" />
        </div>
        <div @click="onExpend">
          <SvgInject :variant="ICON_VARIANTS.desktop" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import settingsStore from '@/store/settings'

import { ZILLIQA } from 'config'
import { ICON_VARIANTS, COLOR_VARIANTS } from '@/config'

import NetworkPage from '@/pages/settings/Networks'
import SvgInject from '@/components/SvgInject'
import P from '@/components/P'

import LinkMixin from '@/mixins/links'
import { Background } from '@/services'

export default {
  name: 'Top',
  mixins: [LinkMixin],
  components: {
    SvgInject,
    P
  },
  props: {
    hiden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ICON_VARIANTS,
      COLOR_VARIANTS,

      LINKS: {
        networkPage: NetworkPage.name
      },
      mainnet: Object.keys(ZILLIQA)[0]
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
    },
    onExpend() {
      this.linksExpand()
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

    .P {
      color: var(--accent-color-warning);
    }

    svg {
      margin-right: 5px;

      g > path {
        fill: var(--accent-color-warning);
      }
    }

    &_main > .P {
      color: var(--accent-color-gray);
    }

    &_main {
      svg > g > path {
        fill: var(--accent-color-gray);
      }
    }
  }

  &__icons {
    display: flex;
    justify-content: space-between;
    min-width: 40px;

    & > div {
      cursor: pointer;
    }
  }

  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: calc(100vw - 40px);
  }
}
</style>
