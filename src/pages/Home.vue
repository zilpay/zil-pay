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
        />
        <FastPanel />
        <Gear
          width="20"
          height="20"
          pointer
        />
      </div>
      <Account />
    </div>
    <Transactions />
    <BottomBar
      :elements="bottomBar"
      @click="navBottom"
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

import BottomBar from '@/components/BottomBar'
import Icon from '@/components/Icon'
import FastPanel from '@/components/FastPanel'
import Account from '@/components/Account'
import Transactions from '@/components/Transactions'

import Burger from '@/components/icons/Burger'
import Gear from '@/components/icons/Gear'

const events = {
  send: uuid(),
  receive: uuid()
}

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
      bottomBar: [
        {
          value: 'Receive',
          event: events.receive,
          icon: ICON_VARIANTS.receive,
          iconType: ICON_TYPE.svg,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm,
          uuid: uuid()
        },
        {
          value: 'Send',
          event: events.send,
          icon: ICON_VARIANTS.send,
          iconType: ICON_TYPE.svg,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm,
          uuid: uuid()
        }
      ]
    }
  },
  methods: {
    navBottom(event) {
      switch (event) {
      case events.send:
        this.$router.push({ name: Send.name })
        break
      case events.receive:
        this.$router.push({ name: Receive.name })
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

  &__wrapper,
  &__nav-bar {
    min-width: calc(100vw - 30px);
  }

  &__wrapper {
    display: grid;
    justify-items: center;
    align-items: center;
    grid-template-rows: 35px 45px;
  }

  &__nav-bar {
    display: inline-grid;
    grid-template-columns: 20px 1fr 20px;
    justify-items: center;
    align-items: center;
  }
}
</style>
