/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { Background } from '@/services'

const bgScript = new Background()
const STORE_NAME = 'wallet'
const STATE_NAMES = {
  isReady: 'isReady',
  isEnable: 'isEnable',
  networkStatus: 'networkStatus'
}
const MUTATIONS_NAMES = {
  setAuth: 'setAuth'
}
const ACTIONS_NAMES = {
  onLedgerAccount: 'onLedgerAccount',
  onKeyStore: 'onKeyStore',
  onInit: 'onInit'
}
const GETTERS_NAMES = { }
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.isReady]: false,
    [STATE_NAMES.isEnable]: false,
    [STATE_NAMES.networkStatus]: null
  },
  mutations: {
    [MUTATIONS_NAMES.setAuth](state, data) {
      state[STATE_NAMES.isEnable] = data.isEnable
      state[STATE_NAMES.isReady] = data.isReady
      state[STATE_NAMES.networkStatus] = data.networkStatus
    }
  },
  actions: {
    [ACTIONS_NAMES.onLedgerAccount]({ state }, payload) {
      // console.log(payload)
    },
    [ACTIONS_NAMES.onKeyStore]({ state }, payload) {
      // console.log(payload)
    },
    async [ACTIONS_NAMES.onInit]({ commit }) {
      let data = null

      try {
        data = await bgScript.getAuthData()
      } catch (rejectedData) {
        data = rejectedData
      }

      commit(MUTATIONS_NAMES.setAuth, data)

      return data
    }
  },
  getters: {}
}

export default {
  STORE_NAME,
  STORE,
  STATE_NAMES,
  MUTATIONS_NAMES,
  ACTIONS_NAMES,
  GETTERS_NAMES
}
