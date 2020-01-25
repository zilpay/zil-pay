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
          v-for="(acc, index) of identities"
          :key="acc.address"
          :account="acc"
          :selected="index === selectedAddress"
          :trash="acc.index > 0"
          @selected="setAccount(index)"
        />
        <div
          v-show="tabs === 1"
          v-for="(contact, index) of contactList"
          :key="index"
        >
          <Item trash pointer>
            <Title :size="SIZE_VARIANS.sm">
              {{ contact.name }}
            </Title>
          </Item>
          <Separator v-show="index < contactList.length - 1"/>
        </div>
      </div>
    </div>
    <BottomBar :elements="BOTTOM_BAR"/>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { mapState, mapMutations } from 'vuex'
import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'
import Tabs from '@/components/Tabs'
import AccountCard from '@/components/AccountCard'
import Item from '@/components/Item'
import Separator from '@/components/Separator'
import Title from '@/components/Title'

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

export default {
  name: 'Accounts',
  components: {
    TopBar,
    BottomBar,
    Tabs,
    AccountCard,
    Item,
    Separator,
    Title
  },
  data() {
    return {
      SIZE_VARIANS,
      BOTTOM_BAR,
      TABS,

      tabs: 0
    }
  },
  computed: {
    ...mapState('contacts', ['contactList']),
    ...mapState('accounts', ['identities', 'selectedAddress'])
  },
  methods: {
    ...mapMutations('accounts', [
      'setAccount'
    ])
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
