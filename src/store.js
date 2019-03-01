import Vue from 'vue'
import Vuex from 'vuex'

import storage from './stroe/storage'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: { storage },
  state: {
    currencyController: {
      nativeCurrency: 'ZIL',
      currentCurrency: 'USD',
      conversionRate: 0.02
    }
  }
})
