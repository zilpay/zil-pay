<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <Title
        :class="b('title')"
        :font="FONT_VARIANTS.medium"
      >
        Recent Transactions:
      </Title>
      <Title
        v-show="getCurrentTransactions.length === 0"
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.regular"
        :variant="COLOR_VARIANTS.gray"
      >
        No Transactions Yet
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
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import transactionsStore from '@/store/transactions'

import { SIZE_VARIANS, FONT_VARIANTS, COLOR_VARIANTS } from '@/config'

import TransactionCard from '@/components/TransactionCard'
import Separator from '@/components/Separator'
import Title from '@/components/Title'
import BottomModal from '@/components/BottomModal'
import TransactionDetails from '@/components/TransactionDetails'

export default {
  name: 'Transactions',
  components: {
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
      COLOR_VARIANTS,

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
  display: flex;
  justify-content: center;

  &__wrapper {
    width: 100%;
    max-width: 340px;
  }

  &__title {
    margin-bottom: 10px;
    font-size: 14px;
  }
}
</style>
