import Vue from 'vue'
import Vuex from 'vuex'
import fetch from 'cross-fetch'
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
      conversionRate: 0
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
      let rate;
      const url = `${apiConfig.COINMARKETCAP}/zilliqa`;

      try {
        const response = await fetch(url, { method: 'GET' });

        rate = await response.json();
        rate = rate[0]['price_usd'] || 0;
      } catch(err) {
        rate = 0;
      }

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
