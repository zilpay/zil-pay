<template>
  <div :class="b()">
    <div :class="b('wrapper')">
    </div>
    <Transactions />
    <BottomBar
      :elements="bottomBar"
      @click="onEvent"
    />
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

import Receive from '@/pages/Receive'
import Send from '@/pages/Send'
import Accounts from '@/pages/Accounts'
import Settings from '@/pages/Settings'

import BottomBar from '@/components/BottomBar'
import Transactions from '@/components/Transactions'

const EVENTS = {
  send: uuid(),
  receive: uuid(),
  accounts: uuid(),
  settings: uuid()
}
export default {
  name: 'Home',
  components: {
    BottomBar,
    Transactions
  },
  data() {
    return {
      ICON_TYPE,
      ICON_VARIANTS,
      COLOR_VARIANTS,
      SIZE_VARIANS,
      EVENTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(accountsStore.STORE_NAME, [
      accountsStore.STATE_NAMES.identities
    ]),

    bottomBar() {
      return [
        {
          value: this.local.RECEIVE,
          event: EVENTS.receive,
          icon: ICON_VARIANTS.receive,
          iconType: ICON_TYPE.svg,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm
        },
        {
          value: this.local.SEND,
          event: EVENTS.send,
          icon: ICON_VARIANTS.send,
          iconType: ICON_TYPE.svg,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm
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
      case EVENTS.send:
        this.$router.push({ name: Send.name })
        break
      case EVENTS.receive:
        this.$router.push({ name: Receive.name })
        break
      case EVENTS.accounts:
        this.$router.push({ name: Accounts.name })
        break
      case EVENTS.settings:
        this.$router.push({ name: Settings.name })
        break
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
  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;

  background-color: var(--app-background-color);
}
</style>
