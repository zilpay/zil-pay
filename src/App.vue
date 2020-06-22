<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { BrowserStorage } from 'lib/storage'
import { FIELDS } from 'config'
import { mapActions, mapMutations, mapState } from 'vuex'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'
import contactsStore from '@/store/contacts'
import walletStore from '@/store/wallet'
import accountsStore from '@/store/accounts'
import transactionsStore from '@/store/transactions'

import FirstPage from '@/pages/FirstStart'
import Verify from '@/pages/Verify'
import Restore from '@/pages/Restore'
import Create from '@/pages/Create'
import Congratulation from '@/pages/Congratulation'

import LockPage from '@/pages/LockScreen'
import homePage from '@/pages/Home'
import PopupPage from '@/pages/Popup'
import ConnectPage from '@/pages/Connect'

import LinkMixin from '@/mixins/links'
import { isExpand, getStorageData } from '@/services'

export default {
  name: 'App',
  mixins: [LinkMixin],
  computed: {
    ...mapState(transactionsStore.STORE_NAME, [
      transactionsStore.STATE_NAMES.confirmationTx
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.connect
    ])
  },
  methods: {
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate,
      settingsStore.ACTIONS_NAMES.onUpdateSettings,
      settingsStore.ACTIONS_NAMES.onUpdateConnection
    ]),
    ...mapActions(uiStore.STORE_NAME, [
      uiStore.ACTIONS_NAMES.onLocal
    ]),
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.onInit
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad,
      uiStore.MUTATIONS_NAMES.setTheme
    ]),
    ...mapMutations(accountsStore.STORE_NAME, [
      accountsStore.MUTATIONS_NAMES.setAccounts,
      accountsStore.MUTATIONS_NAMES.setAccount
    ]),
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setNetwork,
      settingsStore.MUTATIONS_NAMES.setNetworkConfig
    ]),
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onUpdate
    ]),
    ...mapActions(transactionsStore.STORE_NAME, [
      transactionsStore.ACTIONS_NAMES.onUpdateTransactions,
      transactionsStore.ACTIONS_NAMES.onUpdateToConfirmTxs
    ]),

    async authNavigation(authData) {
      const currentRouteName = String(this.$router.history.current.name).toLowerCase()
      const skipRouters = [
        String(Verify.name).toLowerCase(),
        String(Restore.name).toLowerCase(),
        String(Create.name).toLowerCase(),
        String(Congratulation.name).toLowerCase(),
        String(LockPage.name).toLowerCase(),
        String(FirstPage.name).toLowerCase()
      ]
      const test = skipRouters.includes(currentRouteName)

      if (test) {
        return null
      }

      if (!authData.isReady) {
        if (isExpand()) {
          this.linksExpand()
        }

        this.$router.push({ name: FirstPage.name })

        return null
      } else if (authData.isReady && !authData.isEnable && !currentRouteName) {
        this.$router.push({ name: LockPage.name })

        return null
      } else if (this.confirmationTx && this.confirmationTx.length > 0) {
        this.$router.push({ name: PopupPage.name })

        return null
      } else if (this.connect && Object.keys(this.connect).length > 0) {
        this.$router.push({ name: ConnectPage.name })

        return null
      }

      this.$router.push({ name: homePage.name })
    },
    async storeUpdate() {
      const storageData = await getStorageData()

      if (!storageData) {
        return null
      }

      const { wallet, config, selectednet } = storageData

      this.setAccounts(wallet.identities)
      this.setAccount(wallet.selectedAddress)

      this.setNetwork(selectednet)
      this.setNetworkConfig(config)
    }
  },
  async beforeMount() {
    this.setLoad()

    const storage = new BrowserStorage()
    const theme = await storage.get(FIELDS.THEME)
    this.setTheme(theme)

    const authData = await this.onInit()

    await this.onUpdateToConfirmTxs()
    await this.onUpdateConnection()

    this.storeUpdate()
    this.authNavigation(authData)
    this.onLocal()
    this.onUpdate()
    this.onUpdateTransactions()

    this.updateRate()
    this.onUpdateSettings()

    this.setLoad()
  }
}
</script>

<style lang="scss">
@import "./styles/general";

#app {
  width: 100vw;
  height: 100vh;

  & > div {
    width: 100%;
    height: 100%;
  }
}
</style>
