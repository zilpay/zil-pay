/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT } from '../../config/default'
import { ZILLIQA } from '../../config/zilliqa'
import { CURRENCIES, ADDRESS_FORMAT_VARIANTS } from '@/config'

export default {
  namespaced: true,
  state: {
    lockTime: DEFAULT.TIME_BEFORE_LOCK, // in hours.
    currency: CURRENCIES.USD,
    currencyItems: [
      CURRENCIES.BTC,
      CURRENCIES.USD,
      CURRENCIES.ETH
    ],

    addressFormat: ADDRESS_FORMAT_VARIANTS.bech32,
    addressFormatItems: [
      ADDRESS_FORMAT_VARIANTS.bech32,
      ADDRESS_FORMAT_VARIANTS.base16
    ],

    network: Object.keys(ZILLIQA)[0],
    networkConfig: ZILLIQA,

    defaultGas: {
      gasPrice: 1000, // in LI
      gasLimit: 1
    },
    dappsList: [],
    connect: {}
  },
  mutations: {
    setCurrency(state, currency) {
      if (state.currencyItems.includes(currency)) {
        state.currency = currency
      }
    },
    setAddressFormat(state, addressFormat) {
      if (state.addressFormatItems.includes(addressFormat)) {
        state.addressFormat = addressFormat
      }
    },
    setNetwork(state, network) {
      if ((network in state.networkConfig)) {
        state.network = network
      }
    },
    setLockTime(state, time) {
      time = time.replace(' hours.', '')

      if (!isNaN(time)) {
        state.lockTime = time
      }
    }
  },
  actions: {},
  getters: {
    getCurrent: state => `${state.lockTime} hours.`,
    getHours: () => DEFAULT.DEFAULT_HOURS_LOCK.map(hour => `${hour} hours.`)
  }
}
