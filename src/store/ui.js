import { CURRENCIES } from '@/config'


export default {
  namespaced: true,
  state: {
    loading: true,
    isConnect: true,
    conversionRate: {
      [CURRENCIES.BTC]: 0,
      [CURRENCIES.USD]: 0
    }
  },
  mutations: {},
  actions: {},
  getters: {}
}
