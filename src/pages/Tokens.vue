<template>
  <div :class="b()">
    <Top />
    <AddMenu @click="tokenModal = true" />
    <div :class="b('wrapper')">
      <Title :size="SIZE_VARIANS.md">
        {{ $options.name }}
      </Title>
      <ul :class="b('scroll')">
        <li
          v-for="(t, index) of getTokenList"
          :key="index"
        >
          <TokenCard
            :balance="t.balance"
            :name="t.name"
            :symbol="t.symbol"
            :address="t.address"
            :decimals="t.decimals"
            :selected="t.symbol === selectedcoin"
            :defaultToken="t.default"
            @click="onSelectedToken(t)"
            @remove="onRemove(t)"
          />
        </li>
      </ul>
    </div>
    <BottomBar />
    <BottomModal v-model="tokenModal">
      <BackModal
        v-if="tokenModal"
        :name="local.ADD_TOKEN"
        @click="tokenModal = false"
      />
      <TokenCreater
        v-if="tokenModal"
        @input="tokenModal = false"
      />
    </BottomModal>
    <BottomModal
      v-model="removeModal"
      pure
    >
      <BackModal
        v-if="local.HIDE_TOKEN"
        :name="local.HIDE_TOKEN + '?'"
        back
        @click="modals.removeModal = false"
      />
      <div
        v-if="tokenToRemove"
        :class="b('remove')"
      >
        <Icon
          :type="ICON_TYPE.auto"
          :icon="tokenImage(tokenToRemove)"
        />
        <P
          :font="FONT_VARIANTS.bold"
          :size="SIZE_VARIANS.md"
        >
          {{ tokenToRemove.symbol }}
        </P>
        <P
          :size="SIZE_VARIANS.sm"
          centred
        >
          {{ local.HIDE_TOKEN_DES }}
        </P>
        <Tabs
          :elements="tabsElements"
          @input="onEvent"
        />
      </div>
    </BottomModal>
  </div>
</template>

<script>
import { DEFAULT_TOKEN } from 'config'
import { toBech32Address } from '@zilliqa-js/crypto/dist/bech32'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import tokenStore from '@/store/token'
import settingsStore from '@/store/settings'

import { API } from 'config'
import {
  COLOR_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_TYPE,
  ICON_VARIANTS
} from '@/config'

import Home from '@/pages/Home'

import Top from '@/components/Top'
import Title from '@/components/Title'
import Icon from '@/components/Icon'
import P from '@/components/P'
import AddMenu from '@/components/AddMenu'
import TokenCard from '@/components/TokenCard'
import TokenCreater from '@/components/TokenCreater'
import BottomModal from '@/components/BottomModal'
import BackModal from '@/components/BackModal'
import Tabs from '@/components/Tabs'

import { getTokenImage } from '@/utils'

export default {
  name: 'Tokens',
  components: {
    Top,
    P,
    Title,
    TokenCard,
    TokenCreater,
    BottomModal,
    Tabs,
    BackModal,
    Icon,
    AddMenu
  },
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      ICON_VARIANTS,
      API,

      tokenModal: false,
      removeModal: false,
      tokenToRemove: null,
      loaded: false
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local,
      uiStore.STATE_NAMES.selectedTheme
    ]),
    ...mapState(tokenStore.STORE_NAME, [
      tokenStore.STATE_NAMES.selectedcoin
    ]),
    ...mapGetters(tokenStore.STORE_NAME, [
      tokenStore.GETTERS_NAMES.getTokenList
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currentRate
    ]),

    isDark() {
      return this.selectedTheme === 'dark'
    },
    tabsElements() {
      return [
        {
          name: this.local.CANCEL
        },
        {
          name: this.local.HIDE
        }
      ]
    }
  },
  methods: {
    ...mapActions(tokenStore.STORE_NAME, [
      tokenStore.ACTIONS_NAMES.onSelectToken,
      tokenStore.ACTIONS_NAMES.onRemoveToken
    ]),
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.onUpdateTokensRate
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),

    async onSelectedToken(token) {
      await this.onSelectToken(token.symbol)
      this.$router.push({ name: Home.name })
    },
    onRemove(token) {
      this.tokenToRemove = token
      this.removeModal = true
    },
    tokenImage(token) {
      if (token.symbol === DEFAULT_TOKEN.symbol) {
        return getTokenImage(token.symbol, this.isDark)
      }

      try {
        const bech32 = toBech32Address(token.address)

        return getTokenImage(bech32, this.isDark)
      } catch {
        return getTokenImage(token.address, this.isDark)
      }
    },
    async onEvent(event) {
      switch (event) {
      case 0:
        this.tokenToRemove = null
        this.removeModal = false
        break
      case 1:
        this.onRemoveToken(this.tokenToRemove)
        this.tokenToRemove = null
        this.removeModal = false
        break
      default:
        break
      }
    }
  }
}
</script>

<style lang="scss">
.Tokens {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    margin-top: 30px;

    & > .Title {
      text-align: center;
    }
  }

  &__remove {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;

    min-height: 300px;
  }

  &__scroll {
    display: flex;
    flex-direction: column;

    padding: 0;
    list-style: none;

    overflow-y: scroll;
    height: calc(100vh - 210px);
    min-width: 300px;

    & > li {
      margin-top: 10px;
    }
  }
}
</style>
