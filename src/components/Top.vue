<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <div :class="b('network')">
        <SvgInject :variant="ICON_VARIANTS.zilPayIcon" :class="b('icon')" />
        <SvgInject :variant="ICON_VARIANTS.zilPayLogo" :class="b('logo')" />
        <router-link
          :class="b('net', { main: network === mainnet })"
          :to="{ name: LINKS.networkPage }"
        >
          <SvgInject :variant="ICON_VARIANTS.net"/>
          <P>
            {{ network }}
          </P>
        </router-link>
      </div>
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
        <div @click="onAccountExpand">
          <SvgInject :variant="ICON_VARIANTS.blocks" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'

import { ZILLIQA } from 'config'
import {
  ICON_VARIANTS,
  COLOR_VARIANTS,
  ADDRESS_FORMAT_VARIANTS
} from '@/config'

import NetworkPage from '@/pages/settings/Networks'
import SvgInject from '@/components/SvgInject'
import P from '@/components/P'

import LinkMixin from '@/mixins/links'
import ViewblockMixin from '@/mixins/viewblock'
import { Background } from '@/services'
import { toAddress } from '@/filters'

export default {
  name: 'Top',
  mixins: [LinkMixin, ViewblockMixin],
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
      settingsStore.STATE_NAMES.network,
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ])
  },
  methods: {
    onLogout() {
      const bg = new Background()
      bg.logOut()
    },
    onExpend() {
      this.linksExpand()
    },
    onAccountExpand() {
      const { address } = this.getCurrentAccount
      const bech32 = toAddress(
        address,
        ADDRESS_FORMAT_VARIANTS.bech32,
        false
      )

      this.onViewblockAddress(bech32)
    }
  }
}
</script>

<style lang="scss">
.Top {
  display: flex;
  align-items: center;
  justify-content: center;
  width: inherit;
  width: 100%;

  &__network {
    display: flex;
  }

  &__logo {
    display: none;
    margin-right: 40px;
    height: 30px;
    width: auto;

    & > g > path {
      fill: var(--accent-color-primary);
    }
  }

  &__net {
    display: flex;
    align-items: center;
    margin: 0 20px;

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
    min-width: 60px;

    & > div {
      cursor: pointer;

      &:not(:first-child):not(:last-child) {
        margin: 0 20px;
      }
    }
  }

  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
}

@media screen and (min-width: 720px) {
  .Top {
    &__icon {
      display: none;
    }
    &__logo {
      display: block;
    }
  }
}
</style>
