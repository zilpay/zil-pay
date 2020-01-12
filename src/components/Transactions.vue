<template>
  <Alert :class="b()">
    <div :class="b('wrapper')">
      Transactions
    </div>
  </Alert>
</template>

<script>
import Alert from '@/components/Alert'

export default {
  name: 'Transactions',
  components: {
    Alert
  }
}
</script>

<style lang="scss">
.Transactions {
  width: 100vw;

  &__wrapper {
    height: 273px;
  }
}
</style>
