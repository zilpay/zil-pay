<template>
  <div :class="b()">
    <Network
      :width="width"
      :height="width"
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
import { mapActions } from 'vuex'
import settingsStore from '@/store/settings'

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
  methods: {
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate
    ]),

    onNetwork() {
      this.$router.push({ name: NetworkPage.name })
    },
    onConnections() {
      this.$router.push({ name: ConnectionsPage.name })
    },
    onRefresh() {
      this.updateRate()
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
