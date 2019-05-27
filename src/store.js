import Vue from 'vue'
import Vuex from 'vuex'
import fetch from 'cross-fetch'
import extension from 'extensionizer'
import Static from './stores/static'
import Wallet from './stores/wallet'
import Transactions from './stores/transactions'

import apiConfig from '../config/api.json'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: { Static, Wallet, Transactions },
  state: {
    loading: true,
    isConnect: true,
    conversionRate: 0
  },
  mutations: {
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
    },
    mutateIsConnect(state, isConnect) {
      state.isConnect = isConnect;
    }
  },
  actions: {
    async updateRate({ state, getters }) {
      let rate;
      const url = `${apiConfig.COINMARKETCAP}/zilliqa`;
      const currency = state.Static.currency;

      try {
        const response = await fetch(url, { method: 'GET' });
        rate = await response.json();
        if (currency === 'USD') {
          rate = rate[0]['price_usd'];
        } else if (currency === 'BTC') {
          rate = rate[0]['price_btc'];
        }
      } catch(err) {
        rate = 0;
      }

      state.conversionRate = rate;
    },
    onExpand({ getters }) {
      if (getters.isExpand) {
        return null;
      }
      extension.tabs.create({ url: apiConfig.PROMT_PAGE });
    }
  },
  getters: {
    isExpand() {
      if (window.location.pathname.includes('confirm')) {
        return true;
      } else if (window.innerWidth <= 375) {
        return false;
      }

      return true;
    }
  }
})
