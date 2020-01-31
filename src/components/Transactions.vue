<template>
  <Alert :class="b()">
    <div :class="b('wrapper')">
      <Title
        :class="b('title')"
        :size="SIZE_VARIANS.xs"
        :font="FONT_VARIANTS.medium"
      >
        Transactions:
      </Title>
      <div
        v-for="(tx, index) of getCurrentTransactions"
        :key="tx.TranID"
      >
        <TransactionCard :transaction="tx"/>
        <Separator v-show="index < getCurrentTransactions.length - 1" />
      </div>
    </div>
  </Alert>
</template>

<script>
import { mapGetters } from 'vuex'

import { SIZE_VARIANS, FONT_VARIANTS } from '@/config'

import Alert from '@/components/Alert'
import TransactionCard from '@/components/TransactionCard'
import Separator from '@/components/Separator'
import Title from '@/components/Title'

export default {
  name: 'Transactions',
  components: {
    Alert,
    TransactionCard,
    Separator,
    Title
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS
    }
  },
  computed: {
    ...mapGetters('transactions', [
      'getCurrentTransactions'
    ])
  }
}
</script>

<style lang="scss">
.Transactions {
  min-width: 360px;
  min-height: 250px;

  &__title {
    height: 16px;
  }

  &__wrapper {
    display: grid;
    grid-gap: 5px;
  }
}
</style>
