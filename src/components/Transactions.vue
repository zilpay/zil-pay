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
  min-width: 360px;

  &__wrapper {
    height: 273px;
  }
}
</style>
