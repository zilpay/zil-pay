/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { units, BN } from '@zilliqa-js/util'

import { DEFAULT } from 'config'

import { clearTransactionsHistory, getTransactionsHistory } from '@/services'

const STORE_NAME = 'transactions'
const STATE_NAMES = {
  transactions: STORE_NAME,
  confirmationTx: 'confirmationTx'
}
const MUTATIONS_NAMES = {
  setCurrentGas: 'setCurrentGas',
  setConfirmationTx: 'setConfirmationTx',
  setEmpty: 'setEmpty',
  setClearTxHistory: 'setClearTxHistory',
  setTxHistory: 'setTxHistory'
}
const ACTIONS_NAMES = {
  onUpdateTransactions: 'onUpdateTransactions'
}
const GETTERS_NAMES = {
  getCurrent: 'getCurrent',
  getCurrentGas: 'getCurrentGas',
  getCurrentTransactions: 'getCurrentTransactions'
}

const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.transactions]: { },
    [STATE_NAMES.confirmationTx]: []
  },
  mutations: {
    [MUTATIONS_NAMES.setCurrentGas](state, gas) {
      if (!gas || !gas.gasPrice || !gas.gasLimit) {
        return null
      }

      const { gasPrice, gasLimit } = gas
      const gasInQa = units.toQa(gasPrice, units.Units.Li)

      state[STATE_NAMES.confirmationTx][0].gasPrice = String(gasInQa)
      state[STATE_NAMES.confirmationTx][0].gasLimit = gasLimit
    },
    [MUTATIONS_NAMES.setConfirmationTx](state, txParams) {
      state[STATE_NAMES.confirmationTx].push(txParams)
    },
    [MUTATIONS_NAMES.setEmpty](state) {
      state[STATE_NAMES.confirmationTx] = []
    },
    [MUTATIONS_NAMES.setClearTxHistory](state) {
      state[STATE_NAMES.transactions] = {}
      clearTransactionsHistory()
    },
    [MUTATIONS_NAMES.setTxHistory](state, data) {
      state[STATE_NAMES.transactions] = data
    }
  },
  actions: {
    async [ACTIONS_NAMES.onUpdateTransactions]({ commit }) {
      const result = await getTransactionsHistory()

      commit(MUTATIONS_NAMES.setTxHistory, result)
    }
  },
  getters: {
    [GETTERS_NAMES.getCurrent](state) {
      return state.confirmationTx[0]
    },
    [GETTERS_NAMES.getCurrentGas](state) {
      const gasPrice = units.fromQa(
        new BN(state.confirmationTx[0].gasPrice), units.Units.Li
      ).toString()

      return {
        gasPrice,
        gasLimit: state.confirmationTx[0].gasLimit
      }
    },
    [GETTERS_NAMES.getCurrentTransactions](state, _, rootState, rootGetters) {
      try {
        const { address } = rootGetters['accounts/getCurrentAccount']
        const { network } = rootState.settings
        const transactions = state.transactions[address][network] || []

        if (transactions.length > DEFAULT.MAX_TX_AMOUNT_LIST) {
          return transactions.slice(transactions.length - DEFAULT.MAX_TX_AMOUNT_LIST, transactions.length)
        }

        return transactions
      } catch (err) {
        return []
      }
    }
  }
}

export default {
  STORE_NAME,
  STORE,
  STATE_NAMES,
  MUTATIONS_NAMES,
  ACTIONS_NAMES,
  GETTERS_NAMES
}
