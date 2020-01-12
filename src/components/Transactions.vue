<template>
  <Alert :class="b()">
    <div :class="b('wrapper')">
      Transactions
      <Status />
    </div>
  </Alert>
</template>

<script>
import Alert from '@/components/Alert'
import Status from '@/components/icons/Status'

export default {
  name: 'Transactions',
  components: {
    Alert,
    Status
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
