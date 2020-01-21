<template>
  <div :class="b()">
    <TopBar />
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'

export default {
  name: 'Import',
  components: {
    TopBar
  }
}
</script>

<style lang="scss">

</style>
