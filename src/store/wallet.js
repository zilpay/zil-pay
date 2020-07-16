/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import fetch from 'cross-fetch'
import { Background } from '@/services'

const bgScript = new Background()
const STORE_NAME = 'wallet'
const STATE_NAMES = {
  isReady: 'isReady',
  isEnable: 'isEnable',
  networkStatus: 'networkStatus',
  verifly: 'verifly'
}
const MUTATIONS_NAMES = {
  setAuth: 'setAuth',
  setVerifly: 'setVerifly',
  setNetStatus: 'setNetStatus'
}
const ACTIONS_NAMES = {
  onInit: 'onInit',
  checkProvider: 'checkProvider'
}
const GETTERS_NAMES = {}
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.isReady]: null,
    [STATE_NAMES.isEnable]: null,
    [STATE_NAMES.networkStatus]: null,
    [STATE_NAMES.verifly]: null
  },
  mutations: {
    [MUTATIONS_NAMES.setAuth](state, data) {
      state[STATE_NAMES.isEnable] = data.isEnable
      state[STATE_NAMES.isReady] = data.isReady
      state[STATE_NAMES.networkStatus] = data.networkStatus
    },
    [MUTATIONS_NAMES.setVerifly](state, seed) {
      state[STATE_NAMES.verifly] = seed
    },
    [MUTATIONS_NAMES.setNetStatus](state, status) {
      state[STATE_NAMES.networkStatus] = status
    }
  },
  actions: {
    async [ACTIONS_NAMES.onInit]({ commit }) {
      let data = null

      try {
        data = await bgScript.getAuthData()
      } catch (rejectedData) {
        data = rejectedData
      }

      commit(MUTATIONS_NAMES.setAuth, data)

      return data
    },
    async [ACTIONS_NAMES.checkProvider]({ state, commit }, provider) {
      if (!provider) {
        return null
      }

      let status = state[STATE_NAMES.networkStatus]

      try {
        const res = await fetch(provider, {
          method: 'OPTIONS'
        })

        status = res.ok
      } catch (err) {
        status = false
      } finally {
        commit(MUTATIONS_NAMES.setNetStatus, status)
      }
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
