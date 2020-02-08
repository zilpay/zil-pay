/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Vue from 'vue'
import Vuex from 'vuex'

import accountsStore from './accounts'
import contactsStore from './contacts'
import settingsStore from './settings'
import transactionsStore from './transactions'
import ui from './ui'
import wallet from './wallet'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    [accountsStore.STORE_NAME]: accountsStore.STORE,
    [contactsStore.STORE_NAME]: contactsStore.STORE,
    [settingsStore.STORE_NAME]: settingsStore.STORE,
    [transactionsStore.STORE_NAME]: transactionsStore.STORE,
    wallet,
    ui
  }
})
