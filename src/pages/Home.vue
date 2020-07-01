<template>
  <div :class="b()">
    <Top />
    <div :class="b('wrapper')">
      <SettingsList v-model="settingsModal"/>
      <div :class="b('main')">
        <HomeAccount
          v-if="identities && identities.length > 0"
          :class="b('account')"
          @click="settingsModal = true"
        />
        <Transactions :class="b('txns')"/>
        <Tabs
          :class="b('tabs')"
          :elements="tabsElements"
          @input="onEvent"
        />
        <BottomBar />
      </div>
    </div>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { mapState, mapActions, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import modalStore from '@/store/modal'
import tokenStore from '@/store/token'
import accountsStore from '@/store/accounts'

import {
  ICON_TYPE,
  ICON_VARIANTS,
  COLOR_VARIANTS,
  SIZE_VARIANS
} from '@/config'

import Transactions from '@/components/Transactions'
import Top from '@/components/Top'
import HomeAccount from '@/components/HomeAccount'
import Tabs from '@/components/Tabs'
import SettingsList from '@/components/SettingsList'

const EVENTS = {
  receive: uuid(),
  send: uuid()
}

export default {
  name: 'Home',
  components: {
    Top,
    HomeAccount,
    Transactions,
    Tabs,
    SettingsList
  },
  data() {
    return {
      ICON_TYPE,
      ICON_VARIANTS,
      COLOR_VARIANTS,
      SIZE_VARIANS,

      settingsModal: false
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(accountsStore.STORE_NAME, [
      accountsStore.STATE_NAMES.identities
    ]),

    tabsElements() {
      return [
        {
          name: this.local.RECEIVE,
          event: EVENTS.receive
        },
        {
          name: this.local.SEND,
          event: EVENTS.send
        }
      ]
    }
  },
  methods: {
    ...mapActions(tokenStore.STORE_NAME, [
      tokenStore.ACTIONS_NAMES.onBalanceUpdate
    ]),
    ...mapMutations(modalStore.STORE_NAME, [
      modalStore.MUTATIONS_NAMES.setShowSendModal,
      modalStore.MUTATIONS_NAMES.setShowReceiveModal
    ]),

    onEvent(event) {
      switch (event) {
      case 0:
        this.setShowReceiveModal()
        break
      case 1:
        this.setShowSendModal()
        break
      default:
        break
      }
    }
  },
  mounted() {
    this.onBalanceUpdate()
  }
}
</script>

<style lang="scss">
.Home {
  background-color: var(--app-background-color);

  &__wrapper {
    display: flex;
    justify-content: space-around;
  }

  &__main {
    width: 100%;
  }

  &__account,
  &__txns,
  &__tabs {
    margin-top: 10px;
  }
}
</style>
