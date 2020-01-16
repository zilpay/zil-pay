<template>
  <Alert :class="b()">
    <div :class="b('wrapper')">
      <Title
        :class="b('title')"
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.medium"
      >
        Transactions
      </Title>
      <TransactionCard />
      <Separator />
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
          TranID: '8bd99abe0f280d5df9fd515eadd9387090decf5a5c661cfc37bca22fc657f5fd',
          amount: '10000000000000',
          nonce: 55,
          toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2'
        },
        {
          Info: 'Contract Txn, Shards Match of the sender and reciever',
          TranID: 'aaf3ef4c1e5135ac112d55082d97c9c235385bf517c9005e0fc82cbfcd735730',
          amount: '100000000000000',
          nonce: 59,
          toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2'
        }
      ]
    }
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
