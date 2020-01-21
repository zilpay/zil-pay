<template>
  <div :class="b()">
    <TopBar />
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'

export default {
  name: 'Security',
  components: {
    TopBar
  }
}
</script>

<style lang="scss">

</style>
