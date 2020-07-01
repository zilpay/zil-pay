<template>
  <div :class="b()">
    <Top />
    <TopBar v-if="route"/>
    <AddMenu @click="onCreateAccount" />
    <ul :class="b('scroll')">
      <li
        v-for="(acc, index) of identities"
        :key="acc.address"
      >
        <AccountCard
          :account="acc"
          :selected="index === selectedAddress"
          :trash="Boolean(acc.index > 0 || acc.isImport || acc.hwType)"
          @selected="onSelectAccount(index)"
          @remove="onRemoveAccount(index)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import contactsStore from '@/store/contacts'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import tokenStore from '@/store/token'

import { SIZE_VARIANS } from '@/config'

import homePage from '@/pages/Home'

import TopBar from '@/components/TopBar'
import AddMenu from '@/components/AddMenu'
import AccountCard from '@/components/AccountCard'
import Top from '@/components/Top'

import { Background } from '@/services'

export default {
  name: 'Accounts',
  components: {
    TopBar,
    AccountCard,
    Top,
    AddMenu
  },
  data() {
    return {
      SIZE_VARIANS
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

    route() {
      const currentName = this.$router.history.current.name

      if (currentName === this.$options.name) {
        return true
      }

      return false
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
      accountsStore.ACTIONS_NAMES.onRemoveAccount
    ]),
    ...mapActions(tokenStore.STORE_NAME, [
      tokenStore.ACTIONS_NAMES.onBalanceUpdate
    ]),
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onRemoveByIndex
    ]),
    onSelectAccount(index) {
      this.setAccount(index)
      this.$router.push({ name: homePage.name })
    },
    async onCreateAccount() {
      const bg = new Background()

      this.setLoad()

      try {
        const result = await bg.createAccount()

        this.setAccounts(result.identities)
        this.setAccount(result.selectedAddress)
        this.onBalanceUpdate()
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
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__scroll {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 0;
    list-style: none;

    overflow-y: scroll;
    height: calc(100vh - 250px);
    min-width: 300px;

    & > li {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  }
}
</style>
