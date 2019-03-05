import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import storage from './stroe/storage'
import zilliqa from './stroe/zilliqa'
import apiConfig from './config/api'


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
    },

    async updateRate({ state }) {
      let url = `${apiConfig.COINMARKETCAP}/zilliqa`;
      let rate;

      try {
        rate = await axios.get(url);
        rate = rate['data'][0]['price_usd'];
      } catch(err) {
        rate = '0.0164826657';
      }

      state.currencyController.conversionRate = rate;
    }
  }
})
