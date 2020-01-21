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
    />
    <Connections
      :width="width"
      :height="width"
      pointer
      @click="onConnections"
    />
  </div>
</template>

<script>
import NetworkPage from '@/pages/settings/Networks'
import ConnectionsPage from '@/pages/Connections'

import Network from '@/components/icons/Network'
import Refresh from '@/components/icons/Refresh'
import Connections from '@/components/icons/Connections'

export default {
  name: 'FastPanel',
  components: {
    Network,
    Refresh,
    Connections
  },
  data() {
    return {
      width: 20,
      height: 20
    }
  },
  methods: {
    onNetwork() {
      this.$router.push({ name: NetworkPage.name })
    },
    onConnections() {
      this.$router.push({ name: ConnectionsPage.name })
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
