<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <Tabs
        v-model="tabs"
        :elements="TABS"
      />
      <div :class="b('list')">
        <AccountCard
          v-show="tabs === 0"
          v-for="(acc, index) of identities"
          :key="acc.address"
          :account="acc"
          :selected="index === selectedAddress"
          :trash="acc.index > 0"
          @selected="setAccount(index)"
          @remove="onRemoveAccount(index)"
        />
        <div
          v-show="tabs === 1"
          v-for="(contact, index) of contactList"
          :key="index"
        >
          <Item
            trash
            pointer
            @click="onSelectContact(contact)"
            @remove="onRemoveByIndex(index)"
          >
            <Title :size="SIZE_VARIANS.sm">
              {{ contact.name }}
            </Title>
          </Item>
          <Separator v-show="index < contactList.length - 1"/>
        </div>
      </div>
    </div>
    <BottomBar
      :elements="BOTTOM_BAR"
      @click="onEvent"
    />
    <BottomModal v-model="contactModal">
      <ContactCreater
        v-if="contactModal"
        @close="contactModal = false"
      />
    </BottomModal>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { mapState, mapMutations, mapActions } from 'vuex'
import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import SendPage from '@/pages/Send'

import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'
import Tabs from '@/components/Tabs'
import AccountCard from '@/components/AccountCard'
import Item from '@/components/Item'
import Separator from '@/components/Separator'
import Title from '@/components/Title'
import BottomModal from '@/components/BottomModal'
import ContactCreater from '@/components/ContactCreater'

import { toAddress } from '@/filters'

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
    Title,
    BottomModal,
    ContactCreater
  },
  data() {
    return {
      SIZE_VARIANS,
      BOTTOM_BAR,
      TABS,

      tabs: 0,
      contactModal: false
    }
  },
  computed: {
    ...mapState('settings', ['addressFormat']),
    ...mapState('contacts', ['contactList']),
    ...mapState('accounts', ['identities', 'selectedAddress'])
  },
  methods: {
    ...mapMutations('accounts', [
      'setAccount'
    ]),
    ...mapActions('accounts', ['onRemoveAccount']),
    ...mapActions('contacts', ['onRemoveByIndex']),

    onEvent(event) {
      if (EVENTS.create && this.tabs === 1) {
        this.contactModal = true
      }
    },
    onSelectContact(contact) {
      this.$router.push({
        name: SendPage.name,
        params: {
          address: toAddress(contact.address, this.addressFormat, false)
        }
      })
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

  &__list {
    display: grid;
    grid-gap: 15px;
  }
}
</style>
