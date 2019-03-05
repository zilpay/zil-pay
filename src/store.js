import Vue from 'vue'
import Vuex from 'vuex'

import storage from './stroe/storage'
import zilliqa from './stroe/zilliqa'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: { storage, zilliqa },
  state: {
    currencyController: {
      nativeCurrency: 'ZIL',
      currentCurrency: 'USD',
      conversionRate: 0.02
    },
    minGas: 1000000000
  },
  mutations: {
    minGas(state, payload) {
      state.minGas = payload;
    }
  },
  actions: {
    async getGas({ state, commit }) {
      let { blockchain } = state.zilliqa.zilliqa;
      let { result } = await blockchain.getMinimumGasPrice();

      commit('minGas', result);
    }
  }
})
