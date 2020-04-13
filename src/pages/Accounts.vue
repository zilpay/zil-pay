<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <Tabs
        v-model="tabs"
        :elements="tabsElements"
      />
      <div :class="b('list')">
        <AccountCard
          v-show="tabs === 0"
          v-for="(acc, index) of identities"
          :key="acc.address"
          :account="acc"
          :selected="index === selectedAddress"
          :trash="Boolean(acc.index > 0 || acc.isImport || acc.hwType)"
          @selected="onSelectAccount(index)"
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
        <Title
          v-show="tabs === 1 && contactList.length === 0"
          :size="SIZE_VARIANS.sm"
        >
          {{ local.NOT_CONTACTS }}
        </Title>
      </div>
    </div>
    <BottomBar
      :elements="bottomBar"
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
import contactsStore from '@/store/contacts'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import SendPage from '@/pages/Send'
import ImportPage from '@/pages/accounts/Import'
import homePage from '@/pages/Home'

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
import { Background } from '@/services'

const EVENTS = {
  create: uuid(),
  import: uuid(),
  contacts: uuid(),
  accounts: uuid()
}
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

      tabs: 0,
      contactModal: false
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(contactsStore.STORE_NAME, [
      contactsStore.STATE_NAMES.contactList
    ]),
    ...mapState(accountsStore.STORE_NAME, [
      accountsStore.STATE_NAMES.identities,
      accountsStore.STATE_NAMES.selectedAddress
    ]),

    bottomBar() {
      return [
        {
          value: this.local.CREATE,
          event: EVENTS.create,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm
        },
        {
          value: this.local.IMPORT,
          event: EVENTS.import,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm
        }
      ]
    },
    tabsElements() {
      return [
        {
          name: this.local.ACCOUNTS,
          event: EVENTS.accounts
        },
        {
          name: this.local.CONTACTS,
          event: EVENTS.contacts
        }
      ]
    }
  },
  methods: {
    ...mapMutations(accountsStore.STORE_NAME, [
      accountsStore.MUTATIONS_NAMES.setAccount,
      accountsStore.MUTATIONS_NAMES.setAccounts
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapActions(accountsStore.STORE_NAME, [
      accountsStore.ACTIONS_NAMES.onRemoveAccount,
      accountsStore.ACTIONS_NAMES.updateCurrentAccount
    ]),
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onRemoveByIndex
    ]),

    onEvent(event) {
      if (EVENTS.create === event && this.tabs === 1) {
        this.contactModal = true

        return null
      }

      if (EVENTS.create === event && this.tabs === 0) {
        this.onCreateAccount()

        return null
      }

      if (EVENTS.import === event) {
        this.$router.push({
          name: ImportPage.name
        })

        return null
      }
    },
    onSelectAccount(index) {
      this.setAccount(index)
      this.$router.push({ name: homePage.name })
    },
    onSelectContact(contact) {
      this.$router.push({
        name: SendPage.name,
        params: {
          address: toAddress(
            contact.address,
            this.addressFormat,
            false
          )
        }
      })
    },
    async onCreateAccount() {
      const bg = new Background()

      this.setLoad()

      try {
        const result = await bg.createAccount()

        this.setAccounts(result.identities)
        this.setAccount(result.selectedAddress)
        this.updateCurrentAccount()
      } catch (err) {
        //
      } finally {
        this.setLoad()
        this.$router.push({ name: homePage.name })
      }
    }
  }
}
</script>

<style lang="scss">
.Accounts {
  &__wrapper {
    display: grid;
    justify-items: center;
    align-items: baseline;
    grid-template-rows: 80px auto;
    grid-template-rows: 80px auto;
    min-height: 500px;
  }

  &__list {
    display: grid;
    grid-gap: 15px;

    padding-bottom: 50px;
  }
}
</style>
