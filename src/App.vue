<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { BrowserStorage } from 'lib/storage'
import { FIELDS } from 'config'
import { mapActions, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'
import walletStore from '@/store/wallet'
import accountsStore from '@/store/accounts'

import FirstPage from '@/pages/FirstStart'
import LockPage from '@/pages/LockScreen'
import homePage from '@/pages/Home'

import LinkMixin from '@/mixins/links'
import { isExpand, getStorageData } from '@/services'

export default {
  name: 'App',
  mixins: [LinkMixin],
  methods: {
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate,
      settingsStore.ACTIONS_NAMES.onUpdateSettings
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

    async authNavigation(authData) {
      if (!authData.isReady) {
        if (isExpand()) {
          this.linksExpand()
        }

        this.$router.push({ name: FirstPage.name })

        return null
      } else if (!authData.isEnable) {
        this.$router.push({ name: LockPage.name })

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
    const authData = await this.onInit()

    this.setTheme(theme)
    this.storeUpdate()
    this.authNavigation(authData)
    await this.onLocal()

    this.updateRate()
    this.onUpdateSettings()

    this.setLoad()
  }
}
</script>

<style lang="scss">
@import "./styles/general";
</style>
