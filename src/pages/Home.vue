<template>
  <div :class="b()">
    <Top />
    <div :class="b('wrapper')">
      <div :class="b('main')">
        <HomeAccount
          v-if="identities && identities.length > 0"
          :class="b('account')"
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
import { v4 as uuid } from 'uuid'
import { mapState, mapActions, mapMutations } from 'vuex'

import uiStore from '@/store/ui'
import modalStore from '@/store/modal'
import tokenStore from '@/store/token'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'

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
    Tabs
  },
  data() {
    return {
      ICON_TYPE,
      ICON_VARIANTS,
      COLOR_VARIANTS,
      SIZE_VARIANS
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
    ...mapMutations(accountsStore.STORE_NAME, [
      accountsStore.MUTATIONS_NAMES.setAccounts,
      accountsStore.MUTATIONS_NAMES.setAccount
    ]),
    ...mapMutations(modalStore.STORE_NAME, [
      modalStore.MUTATIONS_NAMES.setShowSendModal,
      modalStore.MUTATIONS_NAMES.setShowReceiveModal
    ]),
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.onUpdateTokensRate
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
    this
      .onBalanceUpdate()
      .then(({ identities, selectedAddress }) => {
        this.setAccounts(identities)
        this.setAccount(selectedAddress)

        // return this.onUpdateTokensRate()
      })
      .catch(console.error)
  }
}
</script>

<style lang="scss">
.Home {
  display: flex;
  flex-direction: column;

  &__wrapper {
    display: flex;
    justify-content: space-around;
  }

  &__main {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__account {
    flex: 0 0 auto;
    margin-top: 10px;
  }

  &__txns {
    flex: 1 1 auto;
    flex-direction: column;
    padding-top: 10px;
  }

  &__tabs {
    flex: 0 0 auto;
    margin-top: 15px;
  }
}
</style>
