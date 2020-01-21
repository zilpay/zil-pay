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
      <div v-for="(tx, index) of transactions" :key="tx.TranID">
        <TransactionCard :transaction="tx"/>
        <Separator v-show="index < transactions.length - 1"/>
      </div>
    </div>
  </Alert>
</template>

<script>
import {
  SIZE_VARIANS,
  FONT_VARIANTS
} from '@/config'

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
      FONT_VARIANTS,
      currentAddress: '',
      transactions: [
        {
          Info: 'Contract Txn, Shards Match of the sender and reciever',
          TranID: '8bd99abe0f280d5df9fd515eadd93870902ecf5a5c661cfc37bca22fc657f5fd',
          amount: '10000000000000',
          nonce: 55,
          toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
          status: 'confirmed'
        },
        {
          Info: '',
          TranID: 'aaf3ef4c1e5135ac112d55082d97c9c235385bf567c9005e0fc82cbfcd735730',
          amount: '1000000000000',
          nonce: 52,
          toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
          status: 'rejected'
        },
        {
          Info: 'Contract Creation',
          TranID: 'aaf3ef4c1e5135ac112d55082d27c9c235385bf517c9005e0fc82cbfcd735730',
          amount: '23000000000000',
          nonce: 56,
          toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
          status: 'mining'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.Transactions {
  min-width: 360px;

  &__title {
    height: 16px;
  }

  &__wrapper {
    display: grid;
    grid-gap: 5px;

    height: 273px;
  }
}
</style>
