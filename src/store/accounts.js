/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT } from 'config/default'
import { Background } from '@/services'

const STORE_NAME = 'accounts'
const STATE_NAMES = {
  identities: 'identities',
  selectedAddress: 'selectedAddress'
}
const MUTATIONS_NAMES = {
  setAccounts: 'setAccounts',
  setAccount: 'setAccount',
  setAccountName: 'setAccountName'
}
const ACTIONS_NAMES = {
  onRemoveAccount: 'onRemoveAccount',
  updateCurrentAccount: 'updateCurrentAccount'
}
const GETTERS_NAMES = {
  getCurrentAccount: 'getCurrentAccount'
}
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.identities]: [],
    [STATE_NAMES.selectedAddress]: 0
  },
  mutations: {
    [MUTATIONS_NAMES.setAccounts](state, identities) {
      if (!identities || identities.length < 1) {
        return null
      }

      state.identities = identities
    },
    [MUTATIONS_NAMES.setAccount](state, index) {
      if (isNaN(index) || index > state.identities || index < 0) {
        return null
      }

      state.selectedAddress = index
    },
    [MUTATIONS_NAMES.setAccountName](state, value) {
      if (typeof value !== 'string' || value.length > DEFAULT.MAX_LENGTH_NAME) {
        return null
      }

      const { identities, selectedAddress } = state

      identities[selectedAddress].name = value
    }
  },
  actions: {
    [ACTIONS_NAMES.onRemoveAccount]({ state, commit }, index) {
      if (isNaN(index)) {
        return null
      }

      const { identities, selectedAddress } = state

      if (selectedAddress === index) {
        commit(MUTATIONS_NAMES.setAccount, selectedAddress - 1)
      }

      commit(MUTATIONS_NAMES.setAccounts, identities.filter((_, i) => i !== index))
    },
    async [ACTIONS_NAMES.updateCurrentAccount]({ commit }) {
      const bg = new Background()
      const result = await bg.balanceUpdate()

      commit(MUTATIONS_NAMES.setAccount, result.selectedAddress)
      commit(MUTATIONS_NAMES.setAccounts, result.identities)
    }
  },
  getters: {
    [GETTERS_NAMES.getCurrentAccount]: state => state.identities[state.selectedAddress]
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
