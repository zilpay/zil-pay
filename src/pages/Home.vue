<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <Icon
        :class="b('logo')"
        :icon="ICON_VARIANTS.zilliqaLogo"
        width="22"
        height="30"
      />
      <div :class="b('nav-bar')">
        <Burger
          width="20"
          pointer
          @click="onEvent(EVENTS.accounts)"
        />
        <FastPanel />
        <Gear
          width="20"
          height="20"
          pointer
          @click="onEvent(EVENTS.settings)"
        />
      </div>
      <Account />
    </div>
    <Transactions />
    <BottomBar
      :elements="BOTTOM_BAR"
      @click="onEvent"
    />
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
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
import Icon from '@/components/Icon'
import FastPanel from '@/components/FastPanel'
import Account from '@/components/Account'
import Transactions from '@/components/Transactions'

import Burger from '@/components/icons/Burger'
import Gear from '@/components/icons/Gear'

const EVENTS = {
  send: uuid(),
  receive: uuid(),
  accounts: uuid(),
  settings: uuid()
}
const BOTTOM_BAR = [
  {
    value: 'Receive',
    event: EVENTS.receive,
    icon: ICON_VARIANTS.receive,
    iconType: ICON_TYPE.svg,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  },
  {
    value: 'Send',
    event: EVENTS.send,
    icon: ICON_VARIANTS.send,
    iconType: ICON_TYPE.svg,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  }
]

export default {
  name: 'Home',
  components: {
    BottomBar,
    Icon,
    Burger,
    FastPanel,
    Account,
    Gear,
    Transactions
  },
  data() {
    return {
      ICON_TYPE,
      ICON_VARIANTS,
      COLOR_VARIANTS,
      SIZE_VARIANS,
      EVENTS,
      BOTTOM_BAR
    }
  },
  methods: {
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
  }
}
</script>

<style lang="scss">
.Home {
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-rows: 1fr 1fr;

  &__wrapper,
  &__nav-bar {
    min-width: calc(360px - 30px);
  }

  &__wrapper {
    display: grid;
    justify-items: center;
    align-items: center;
    grid-template-rows: 30px 45px;

    padding-top: 15px;
  }

  &__nav-bar {
    display: inline-grid;
    grid-template-columns: 20px 1fr 20px;
    justify-items: center;
    align-items: center;
  }
}
</style>
