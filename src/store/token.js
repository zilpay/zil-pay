/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { getTokens, Background } from '@/services'

const STORE_NAME = 'token'
const STATE_NAMES = {
  tokens: 'tokens',
  selectedcoin: 'selectedcoin'
}
const MUTATIONS_NAMES = {
  setTokens: 'setTokens',
  setSelectedCoin: 'setSelectedCoin'
}
const ACTIONS_NAMES = {
  onUpdateTokensStore: 'onUpdateTokensStore',
  onAddToken: 'onAddToken'
}
const GETTERS_NAMES = {
  getSelectedToken: 'getSelectedToken'
}
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.tokens]: [],
    [STATE_NAMES.selectedcoin]: 'ZIL'
  },
  mutations: {
    [MUTATIONS_NAMES.setSelectedCoin](state, value) {
      state[STATE_NAMES.selectedcoin] = value
    },
    [MUTATIONS_NAMES.setTokens](state, values) {
      state[STATE_NAMES.tokens] = values
    }
  },
  actions: {
    async [ACTIONS_NAMES.onUpdateTokensStore]({ commit }) {
      const data = await getTokens()

      if (data && data[STATE_NAMES.selectedcoin]) {
        commit(MUTATIONS_NAMES.setSelectedCoin, data[STATE_NAMES.selectedcoin])
      }
      if (data && data[STATE_NAMES.tokens]) {
        commit(MUTATIONS_NAMES.setTokens, data[STATE_NAMES.tokens])
      }

      return data
    },
    async [ACTIONS_NAMES.onAddToken]({ commit }, address) {
      const bg = new Background()
      const data = await bg.setToken(address)

      commit(MUTATIONS_NAMES.setSelectedCoin, data[STATE_NAMES.selectedcoin])
      commit(MUTATIONS_NAMES.setTokens, data[STATE_NAMES.tokens])

      return data
    }
  },
  getters: {
    [GETTERS_NAMES.getSelectedToken](state) {
      const { tokens, selectedcoin } = state

      return tokens.find((t) => t.symbol === selectedcoin)
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
