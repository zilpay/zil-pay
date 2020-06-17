<template>
  <div :class="b()">
    <Top />
    <div :class="b('wrapper')">
      <HomeAccount :class="b('account')"/>
      <Transactions :class="b('txns')"/>
      <Tabs
        :class="b('tabs')"
        :elements="tabsElements"
      />
    </div>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { mapState, mapActions } from 'vuex'
import uiStore from '@/store/ui'
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
    ...mapActions(accountsStore.STORE_NAME, [
      accountsStore.ACTIONS_NAMES.updateCurrentAccount
    ]),

    onEvent(event) {
      switch (event) {
      // case EVENTS.send:
      //   this.$router.push({ name: Send.name })
      //   break
      // case EVENTS.receive:
      //   this.$router.push({ name: Receive.name })
      //   break
      // case EVENTS.accounts:
      //   this.$router.push({ name: Accounts.name })
      //   break
      // case EVENTS.settings:
      //   this.$router.push({ name: Settings.name })
      //   break
      default:
        break
      }
    }
  },
  mounted() {
    this.updateCurrentAccount()
  }
}
</script>

<style lang="scss">
.Home {
  background-color: var(--app-background-color);

  &__account,
  &__txns,
  &__tabs {
    margin-top: 10px;
  }
}
</style>
