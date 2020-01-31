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
        @click="onSelect(index)"
      >
        <TransactionCard :transaction="tx"/>
        <Separator v-show="index < getCurrentTransactions.length - 1" />
      </div>
    </div>
    <BottomModal v-model="info">
      {{ selectedTx }}
    </BottomModal>
  </Alert>
</template>

<script>
import { mapGetters } from 'vuex'

import { SIZE_VARIANS, FONT_VARIANTS } from '@/config'

import Alert from '@/components/Alert'
import TransactionCard from '@/components/TransactionCard'
import Separator from '@/components/Separator'
import Title from '@/components/Title'
import BottomModal from '@/components/BottomModal'

export default {
  name: 'Transactions',
  components: {
    Alert,
    TransactionCard,
    Separator,
    Title,
    BottomModal
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      info: false,
      selected: null
    }
  },
  computed: {
    ...mapGetters('transactions', [
      'getCurrentTransactions'
    ]),
    selectedTx() {
      return this.getCurrentTransactions[this.selected]
    }
  },
  methods: {
    onSelect(index) {
      this.selected = index
      this.info = true
    }
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
