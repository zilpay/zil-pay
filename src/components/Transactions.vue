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
      <Title
        v-show="getCurrentTransactions.length === 0"
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.regular"
      >
        You don’t have any transactions yet.
      </Title>
      <div
        v-for="(tx, index) of getCurrentTransactions"
        :key="index"
        @click="onSelect(index)"
      >
        <TransactionCard :transaction="tx"/>
        <Separator v-show="index < getCurrentTransactions.length - 1" />
      </div>
    </div>
    <BottomModal v-model="info">
      <TransactionDetails
        v-if="getCurrentAccount && selectedTx"
        :account="getCurrentAccount"
        :transaction="selectedTx"
      />
    </BottomModal>
  </Alert>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import transactionsStore from '@/store/transactions'

import { SIZE_VARIANS, FONT_VARIANTS } from '@/config'

import Alert from '@/components/Alert'
import TransactionCard from '@/components/TransactionCard'
import Separator from '@/components/Separator'
import Title from '@/components/Title'
import BottomModal from '@/components/BottomModal'
import TransactionDetails from '@/components/TransactionDetails'

export default {
  name: 'Transactions',
  components: {
    Alert,
    TransactionCard,
    Separator,
    Title,
    BottomModal,
    TransactionDetails
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
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),
    ...mapGetters(transactionsStore.STORE_NAME, [
      transactionsStore.GETTERS_NAMES.getCurrentTransactions
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
  margin-bottom: 40px;

  &__title {
    height: 16px;
  }

  &__wrapper {
    display: grid;
    grid-gap: 5px;
  }
}
</style>
