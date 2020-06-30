/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
const STORE_NAME = 'token'
const STATE_NAMES = {
  tokenList: 'tokenList',
  selectedcoin: 'selectedcoin'
}
const MUTATIONS_NAMES = {
}
const ACTIONS_NAMES = {
}
const GETTERS_NAMES = {
  getSelectedToken: 'getSelectedToken'
}
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.tokenList]: [],
    [STATE_NAMES.selectedcoin]: 'ZIL'
  },
  mutations: {
  },
  actions: {
  },
  getters: {
    [GETTERS_NAMES.getSelectedToken](state) {
      const { tokenList, selectedcoin } = state

      return tokenList.find((t) => t.symbol === selectedcoin)
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
