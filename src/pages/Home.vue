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
    <BottomBar :elements="bottomBar"/>
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

import BottomBar from '@/components/BottomBar'
import Icon from '@/components/Icon'
import FastPanel from '@/components/FastPanel'
import Account from '@/components/Account'
import Transactions from '@/components/Transactions'

import Burger from '@/components/icons/Burger'
import Gear from '@/components/icons/Gear'

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
          event: 'receive',
          icon: ICON_VARIANTS.add,
          iconType: ICON_TYPE.svg,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm,
          uuid: uuid()
        },
        {
          value: 'Send',
          event: 'send',
          icon: ICON_VARIANTS.add,
          iconType: ICON_TYPE.svg,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm,
          uuid: uuid()
        }
      ]
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
