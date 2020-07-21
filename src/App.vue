<template>
  <div id="app">
    <router-view/>
    <footer>
      <BottomModal
        v-show="receiveModal.show"
        :value="receiveModal.show"
        @input="setShowReceiveModal"
      >
        <Receive />
      </BottomModal>
      <BottomModal
        v-show="sendModal.show"
        :value="sendModal.show"
        @input="setShowSendModal"
      >
        <Send />
      </BottomModal>
      <BottomModal
        v-show="accountModal.show"
        :value="accountModal.show"
        @input="setShowAccountModal"
      >
        <Account />
      </BottomModal>
      <SettingsList v-model="sideBarSettings"/>
    </footer>
  </div>
</template>

<script>
import { BrowserStorage } from 'lib/storage'
import { FIELDS } from 'config'

import { mapActions, mapMutations, mapState } from 'vuex'
import uiStore from '@/store/ui'
import modalStore from '@/store/modal'
import settingsStore from '@/store/settings'
import contactsStore from '@/store/contacts'
import walletStore from '@/store/wallet'
import accountsStore from '@/store/accounts'
import tokensStore from '@/store/token'
import transactionsStore from '@/store/transactions'

import BottomModal from '@/components/BottomModal'
import SettingsList from '@/components/SettingsList'

import Receive from '@/views/Receive'
import Account from '@/views/Account'
import Send from '@/views/Send'

import Popup from '@/pages/Popup'
import ConnectPage from '@/pages/Connect'

import LinkMixin from '@/mixins/links'
import { getStorageData } from '@/services'

export default {
  name: 'App',
  mixins: [LinkMixin],
  components: {
    BottomModal,
    Receive,
    Send,
    Account,
    SettingsList
  },
  data() {
    return {
      storageSubscribe: null
    }
  },
  computed: {
    ...mapState(transactionsStore.STORE_NAME, [
      transactionsStore.STATE_NAMES.confirmationTx
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.connect
    ]),
    ...mapState(modalStore.STORE_NAME, [
      modalStore.STATE_NAMES.sendModal,
      modalStore.STATE_NAMES.receiveModal,
      modalStore.STATE_NAMES.sideBarSettings,
      modalStore.STATE_NAMES.accountModal
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
    ...mapActions(tokensStore.STORE_NAME, [
      tokensStore.ACTIONS_NAMES.onUpdateTokensStore
    ]),
    ...mapMutations(tokensStore.STORE_NAME, [
      tokensStore.MUTATIONS_NAMES.setTokens,
      tokensStore.MUTATIONS_NAMES.setSelectedCoin
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
      settingsStore.MUTATIONS_NAMES.setNetworkConfig,
      settingsStore.MUTATIONS_NAMES.setBlockNumber
    ]),
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onUpdate
    ]),
    ...mapActions(transactionsStore.STORE_NAME, [
      transactionsStore.ACTIONS_NAMES.onUpdateTransactions,
      transactionsStore.ACTIONS_NAMES.onUpdateToConfirmTxs
    ]),
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setTxHistory
    ]),
    ...mapMutations(modalStore.STORE_NAME, [
      modalStore.MUTATIONS_NAMES.setShowSendModal,
      modalStore.MUTATIONS_NAMES.setShowReceiveModal,
      modalStore.MUTATIONS_NAMES.setShowAccountModal
    ]),

    async storeUpdate() {
      const storageData = await getStorageData()

      if (!storageData) {
        return null
      }

      const { wallet, config, selectednet, blocknumber } = storageData

      if (wallet && wallet.identities) {
        this.setAccounts(wallet.identities)
        this.setAccount(wallet.selectedAddress)
      }

      this.setNetworkConfig(config)

      if (blocknumber) {
        this.setBlockNumber(blocknumber)
      }

      if (!selectednet) {
        const [net] = Object.keys(config)
        this.setNetwork(net)
      } else {
        this.setNetwork(selectednet)
      }
    }
  },
  async beforeMount() {
    this.setLoad()

    const storage = new BrowserStorage()
    const theme = await storage.get(FIELDS.THEME)
    this.setTheme(theme)

    await this.onInit()

    const forConfirm = await this.onUpdateToConfirmTxs()

    if (forConfirm && forConfirm.length !== 0) {
      this.$router.push({ name: Popup.name })
    }

    await this.onUpdateConnection()

    this.storeUpdate()
    this.onUpdateTokensStore()
    this.onLocal()
    this.onUpdate()
    this.onUpdateTransactions()

    if (this.connect && Object.keys(this.connect).length > 0) {
      this.$router.push({ name: ConnectPage.name })
    }

    this.updateRate()
    this.onUpdateSettings()

    this.setLoad()

    this.storageSubscribe = BrowserStorage.subscribe((store) => {
      Object.keys(store).forEach((key) => {
        const { newValue } = store[key]

        switch (key) {
        case FIELDS.WALLET:
          this.setAccounts(newValue.identities)
          this.setAccount(newValue.selectedAddress)
          break
        case FIELDS.TOKENS:
          this.setTokens(newValue)
          break
        case FIELDS.SELECTED_COIN:
          this.setSelectedCoin(newValue)
          break
        case FIELDS.TRANSACTIONS:
          this.setTxHistory(newValue)
          break
        case FIELDS.SELECTED_NET:
          this.setNetwork(newValue)
          break
        case FIELDS.BLOCK_NUMBER:
          this.setBlockNumber(newValue)
          break
        default:
          break
        }
      })
    })
  },
  beforeDestroy() {
    if (this.storageSubscribe) {
      this.storageSubscribe.unsubscribe()
    }
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
