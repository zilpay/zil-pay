import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import extension from 'extensionizer'

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
    minGas: '1000000000',
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
        spiner.className = 'isLoad';        
        app.style.filter = 'blur(5px)';
      } else {
        app.style.filter = null;
        spiner.className = null;   
        spiner.style.display = 'none';
      }
    }
  },
  actions: {
    async updateRate({ state }) {
      let url = `${apiConfig.COINMARKETCAP}/zilliqa`;
      let rate;

      rate = await axios.get(url);
      rate = rate['data'][0]['price_usd'];

      state.currencyController.conversionRate = rate;
    },

    onExpand() {
      extension.tabs.create({ url: apiConfig.PROMT_PAGE });
    }
  },
  getters: {
    isExpand() {
      if (window.location.pathname.includes('confirm')) {
        return true;
      } else if (window.innerWidth <= 350) {
        return false;
      }

      return true;
    }
  }
})
