/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import fetch from 'cross-fetch'

import { DEFAULT, API } from 'config'
import { TypeChecker } from '../../lib/type'
import { ZILLIQA, DEFAULT_GAS_FEE } from 'config/zilliqa'
import { CURRENCIES, ADDRESS_FORMAT_VARIANTS } from '@/config'

import { setSelectedNetwork } from '@/services'

const STORE_NAME = 'settings'
const STATE_NAMES = {
  lockTime: 'lockTime',
  currency: 'currency',
  currencyItems: 'currencyItems',
  addressFormat: 'addressFormat',
  addressFormatItems: 'addressFormatItems',
  network: 'network',
  networkConfig: 'networkConfig',
  defaultGas: 'defaultGas',
  dappsList: 'dappsList',
  connect: 'connect',
  currentRate: 'currentRate'
}
const MUTATIONS_NAMES = {
  setCurrency: 'setCurrency',
  setAddressFormat: 'setAddressFormat',
  setNetwork: 'setNetwork',
  setLockTime: 'setLockTime',
  setGas: 'setGas',
  setDefaultGas: 'setDefaultGas',
  setRate: 'setRate',
  setNetworkConfig: 'setNetworkConfig'
}
const ACTIONS_NAMES = {
  updateRate: 'updateRate'
}
const GETTERS_NAMES = {
  getCurrent: 'getCurrent',
  getHours: 'getHours',
  getRate: 'getRate'
}

const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.lockTime]: DEFAULT.TIME_BEFORE_LOCK, // in hours.
    [STATE_NAMES.currency]: CURRENCIES.USD,
    [STATE_NAMES.currencyItems]: [
      CURRENCIES.BTC,
      CURRENCIES.USD
    ],

    [STATE_NAMES.addressFormat]: ADDRESS_FORMAT_VARIANTS.bech32,
    [STATE_NAMES.addressFormatItems]: [
      ADDRESS_FORMAT_VARIANTS.bech32,
      ADDRESS_FORMAT_VARIANTS.base16
    ],

    [STATE_NAMES.network]: Object.keys(ZILLIQA)[0],
    [STATE_NAMES.networkConfig]: ZILLIQA,

    [STATE_NAMES.defaultGas]: DEFAULT_GAS_FEE,
    [STATE_NAMES.dappsList]: [],
    [STATE_NAMES.connect]: {},
    [STATE_NAMES.currentRate]: {
      [CURRENCIES.BTC]: 0,
      [CURRENCIES.USD]: 0
    }
  },
  mutations: {
    [MUTATIONS_NAMES.setCurrency](state, currency) {
      if (state.currencyItems.includes(currency)) {
        state.currency = currency
      }
    },
    [MUTATIONS_NAMES.setNetworkConfig](state, config) {
      if (config && new TypeChecker(config).isObject) {
        state[STATE_NAMES.networkConfig] = config
      }
    },
    [MUTATIONS_NAMES.setAddressFormat](state, addressFormat) {
      if (state.addressFormatItems.includes(addressFormat)) {
        state.addressFormat = addressFormat
      }
    },
    [MUTATIONS_NAMES.setNetwork](state, network) {
      if ((network in state.networkConfig)) {
        state.network = network
        setSelectedNetwork(network)
      }
    },
    [MUTATIONS_NAMES.setLockTime](state, time) {
      time = time.replace(' hours.', '')

      if (!isNaN(time)) {
        state.lockTime = time
      }
    },
    [MUTATIONS_NAMES.setGas](state, { gasPrice, gasLimit }) {
      if (gasPrice && gasLimit) {
        state.defaultGas = { gasPrice, gasLimit }
      }
    },
    [MUTATIONS_NAMES.setDefaultGas](state) {
      state.defaultGas = DEFAULT_GAS_FEE
    },
    [MUTATIONS_NAMES.setRate](state, payload) {
      state[STATE_NAMES.currentRate] = payload
    }
  },
  actions: {
    async [ACTIONS_NAMES.updateRate]({ commit }) {
      let rate = null
      const url = `${API.COINMARKETCAP}/zilliqa`

      try {
        const response = await fetch(url, { method: 'GET' })

        rate = await response.json()

        rate = {
          USD: rate[0]['price_usd'],
          BTC: rate[0]['price_btc']
        }
      } catch (err) {
        rate = {
          BTC: 0,
          USD: 0
        }
      }

      commit(MUTATIONS_NAMES.setRate, rate)
    }
  },
  getters: {
    [GETTERS_NAMES.getRate]: state => {
      const currentCurrency = state[STATE_NAMES.currency]

      return state[STATE_NAMES.currentRate][currentCurrency]
    },
    [GETTERS_NAMES.getCurrent]: state => `${state.lockTime} hours.`,
    [GETTERS_NAMES.getHours]: () => DEFAULT.DEFAULT_HOURS_LOCK.map(hour => `${hour} hours.`)
  }
}

export default {
  STORE_NAME,
  STORE,
  STATE_NAMES,
  MUTATIONS_NAMES,
  ACTIONS_NAMES,
  GETTERS_NAMES
}
