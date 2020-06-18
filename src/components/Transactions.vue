<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <Title
        :class="b('title')"
        :font="FONT_VARIANTS.light"
      >
        <span>
          {{ local.RECENT_TX }}:
        </span>
        <a @click="setClearTxHistory">
          {{ local.CLEAR_ALL }}
        </a>
      </Title>
      <div :class="b('scroll')">
        <Title
          v-show="getCurrentTransactions.length === 0"
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.regular"
          :variant="COLOR_VARIANTS.gray"
        >
          {{ local.HOS_NOT_TX }}
        </Title>
        <div
          v-for="(tx, index) of getCurrentTransactions"
          :key="index"
          @click="onSelect(index)"
        >
          <TransactionCard :transaction="tx"/>
        </div>
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
import { mapGetters, mapState, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import accountsStore from '@/store/accounts'
import transactionsStore from '@/store/transactions'

import { SIZE_VARIANS, FONT_VARIANTS, COLOR_VARIANTS } from '@/config'

import TransactionCard from '@/components/TransactionCard'
import Title from '@/components/Title'
import BottomModal from '@/components/BottomModal'
import TransactionDetails from '@/components/TransactionDetails'

export default {
  name: 'Transactions',
  components: {
    TransactionCard,
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
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
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
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setClearTxHistory
    ]),

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

  padding-left: 15px;
  padding-right: 15px;

  &__wrapper {
    width: 100%;
    max-width: 400px;
  }

  &__scroll {
    display: grid;
    grid-gap: 10px;

    margin-top: 10px;

    overflow-y: scroll;
    height: calc(100vh - 306px);
  }

  &__title {
    display: flex;
    justify-content: space-between;

    font-size: 14px;

    a,
    a:hover {
      cursor: pointer;
      color: var(--accent-color-primary);
      text-decoration: underline;
    }
  }
}
</style>
