import Vue from 'vue'
import Vuex from 'vuex'

import wallet from './stroe/wallet'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: { wallet },
  state: {
    currencyController: {
      nativeCurrency: 'ZIL',
      currentCurrency: 'USD',
      conversionRate: 0.02
    },
    networkController: {
      id: 1,
      provider: 'https://dev-api.zilliqa.com'
    },
    transactions: {
      history: []
    }
  },
  mutations: {
    // PASSWORD: (state, payload) => state.password = payload
  }
})
