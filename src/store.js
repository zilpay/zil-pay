import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import storage from './stroe/storage'
import apiConfig from './config/api'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: { storage },
  state: {
    currencyController: {
      nativeCurrency: 'ZIL',
      currentCurrency: 'USD',
      conversionRate: 0.02
    },
    minGas: 1000000000,
    loading: true
  },
  mutations: {
    minGas(state, payload) {
      state.minGas = payload;
    },
    spiner(state) {
      let spiner = window.document.querySelector('#spinner');
      let app = window.document.querySelector('#app');

      state.loading = !state.loading;

      if (state.loading) {
        spiner.style.display = 'block';
        app.style.filter = 'blur(5px)';
      } else {
        app.style.filter = null;
        spiner.style.display = 'none';
      }
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
