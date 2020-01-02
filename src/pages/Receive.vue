<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">

    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'

export default {
  name: 'Receive',
  components: {
    TopBar
  }
}
</script>

<style lang="scss">
.Receive {
  &__wrapper {
    display: grid;
  }
}
</style>
