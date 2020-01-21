<template>
  <div :class="b()">
    <TopBar />
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'

export default {
  name: 'TxData',
  components: {
    TopBar
  }
}
</script>

<style lang="scss">

</style>
