<template>
  <div :class="b()">
    <Network
      :width="width"
      :height="width"
      :color="netIconColor"
      pointer
      @click="onNetwork"
    />
    <Refresh
      :width="width"
      :height="width"
      pointer
      @click="onRefresh"
    />
    <Connections
      :width="width"
      :height="width"
      pointer
      @click="onConnections"
    />
    <Lock
      :width="width"
      :height="width"
      pointer
      @click="onLogout"
    />
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import { COLOR_VARIANTS } from '@/config'

import NetworkPage from '@/pages/settings/Networks'
import ConnectionsPage from '@/pages/Connections'

import Network from '@/components/icons/Network'
import Refresh from '@/components/icons/Refresh'
import Connections from '@/components/icons/Connections'
import Lock from '@/components/icons/Lock'

import { Background } from '@/services'

export default {
  name: 'FastPanel',
  components: {
    Network,
    Refresh,
    Lock,
    Connections
  },
  data() {
    return {
      width: 20,
      height: 20
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.network,
      settingsStore.STATE_NAMES.networkConfig
    ]),
    ...mapState(walletStore.STORE_NAME, [
      walletStore.STATE_NAMES.networkStatus
    ]),

    netIconColor() {
      const mainnet = Object.keys(this.networkConfig)[0]

      if (!this.networkStatus) {
        return COLOR_VARIANTS.danger
      } else if (mainnet === this.network) {
        return null
      }

      return COLOR_VARIANTS.warning
    }
  },
  methods: {
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate
    ]),
    ...mapActions(accountsStore.STORE_NAME, [
      accountsStore.ACTIONS_NAMES.updateCurrentAccount
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.checkProvider
    ]),

    onNetwork() {
      this.$router.push({ name: NetworkPage.name })
    },
    onConnections() {
      this.$router.push({ name: ConnectionsPage.name })
    },
    async onRefresh() {
      this.setLoad()

      try {
        await this.updateRate()
        await this.checkProvider()
        await this.updateCurrentAccount()
      } catch (err) {
        //
      } finally {
        this.setLoad()
      }
    },
    onLogout() {
      const bg = new Background()

      bg.logOut()
    }
  }
}
</script>

<style lang="scss">
.FastPanel {
  display: flex;
  justify-content: space-between;

  width: 100px;
}
</style>
