<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <Tabs
        v-model="tabs"
        :elements="TABS"
      />
      <div :class="b('account-list')">
        <AccountCard
          v-show="tabs === 0"
          v-for="(acc, index) of TEST_ACCOUNTS.identities"
          :key="acc.address"
          :account="acc"
          :selected="index === TEST_ACCOUNTS.selectedAddress"
          :trash="acc.index > 0"
        />
        <div v-show="tabs === 1">
          <Item pointer>
            <Plus />
            <Title :size="SIZE_VARIANS.sm">
              New contact
            </Title>
          </Item>
          <Separator/>
          <div
            v-for="(contact, index) of TEST_CONTACTS"
            :key="index"
          >
            <Item trash pointer>
              <Title :size="SIZE_VARIANS.sm">
                {{ contact.name }}
              </Title>
            </Item>
            <Separator v-show="index < TEST_CONTACTS.length - 1"/>
          </div>
        </div>
      </div>
    </div>
    <BottomBar :elements="BOTTOM_BAR"/>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import {
  COLOR_VARIANTS,
  SIZE_VARIANS
} from '@/config'

import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'
import Tabs from '@/components/Tabs'
import AccountCard from '@/components/AccountCard'
import Item from '@/components/Item'
import Separator from '@/components/Separator'
import Title from '@/components/Title'
import Plus from '@/components/icons/Plus'

const EVENTS = {
  create: uuid(),
  import: uuid(),
  contacts: uuid(),
  accounts: uuid()
}
const BOTTOM_BAR = [
  {
    value: 'CREATE',
    event: EVENTS.create,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  },
  {
    value: 'IMPORT',
    event: EVENTS.import,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  }
]
const TABS = [
  {
    name: 'Accounts',
    event: EVENTS.accounts
  },
  {
    name: 'Contacts',
    event: EVENTS.contacts
  }
]
const TEST_ACCOUNTS = {
  identities: [
    {
      address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F',
      balance: '463851500000000',
      index: 0,
      name: 'Account 0'
    },
    {
      address: '0xF59eCFE8e1844C7708e55750057669db8cAE46a4',
      balance: '1500000000',
      hwType: 'ledger',
      index: '5',
      name: 'Ledger 5',
      pubKey: '0357d1d720b1987a8093588259158e055cdaf0f1b7c10758e83b9580bdba423a32'
    },
    {
      address: '0xEa442d03947cEa05b18c666f178D617D909D1F92',
      balance: '463851500000000',
      index: 2,
      name: 'Account 1'
    },
    {
      address: '0x6e54F8dB8B876803aB55259E14d157e0326B2Db4',
      balance: '463851500000000',
      index: 3,
      name: 'Account 2'
    },
    {
      address: '0x4ef291cEbD95ab4231eB52b02Cdf0E231Eab565a',
      balance: '463851500000000',
      index: 4,
      name: 'Account 3'
    },
  ],
  selectedAddress: 1
}
const TEST_CONTACTS = [
  {
    name: 'Ark warden.',
    address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F'
  },
  {
    name: 'Terrorblade.',
    address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F'
  },
  {
    name: 'Doom.',
    address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F'
  }
]

export default {
  name: 'Accounts',
  components: {
    TopBar,
    BottomBar,
    Tabs,
    AccountCard,
    Item,
    Separator,
    Title,
    Plus
  },
  data() {
    return {
      SIZE_VARIANS,
      BOTTOM_BAR,
      TABS,
      TEST_ACCOUNTS,
      TEST_CONTACTS,

      tabs: 0
    }
  }
}
</script>

<style lang="scss">
.Accounts {
  &__wrapper {
    display: grid;
    justify-items: center;
    align-items: center;
    grid-template-rows: 80px auto;
  }

  &__account-list {
    display: grid;
    grid-gap: 15px;
  }
}
</style>
