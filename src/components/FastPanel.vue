<template>
  <div :class="b()">
    <Network
      :width="width"
      :height="width"
      pointer
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
    />
  </div>
</template>

<script>
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
  }
}
</script>

<style lang="scss">
.FastPanel {
  display: flex;
  justify-content: space-between;

  width: 80px;
}
</style>
