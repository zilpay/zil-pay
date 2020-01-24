/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
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
