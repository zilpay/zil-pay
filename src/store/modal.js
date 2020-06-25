/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
const STORE_NAME = 'modal'
const STATE_NAMES = {
  sendModal: 'sendModal',
  receiveModal: 'receiveModal',
  accountModal: 'accountModal'
}
const MUTATIONS_NAMES = {
  setShowSendModal: 'setShowSendModal',
  setShowReceiveModal: 'setShowReceiveModal',
  setShowAccountModal: 'setShowAccountModal'
}
const ACTIONS_NAMES = {
}
const GETTERS_NAMES = {}
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.sendModal]: {
      step: 0,
      show: false,
      payload: null
    },
    [STATE_NAMES.receiveModal]: {
      step: 0,
      show: false,
      payload: null
    },
    [STATE_NAMES.accountModal]: {
      step: 0,
      show: false,
      payload: null
    }
  },
  mutations: {
    [MUTATIONS_NAMES.setShowSendModal](state) {
      state[STATE_NAMES.sendModal].show = !state[STATE_NAMES.sendModal].show
    },
    [MUTATIONS_NAMES.setShowReceiveModal](state) {
      state[STATE_NAMES.receiveModal].show = !state[STATE_NAMES.receiveModal].show
    },
    [MUTATIONS_NAMES.setShowAccountModal](state) {
      state[STATE_NAMES.accountModal].show = !state[STATE_NAMES.accountModal].show
    }
  },
  actions: {
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
