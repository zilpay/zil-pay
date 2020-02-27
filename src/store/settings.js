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

import { setSelectedNetwork, updateStatic, updateNetworkConifg } from '@/services'

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
  updateRate: 'updateRate',
  onUpdateSettings: 'onUpdateSettings'
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
        if (state.currency !== currency) {
          updateStatic(state, true)
        }

        state.currency = currency
      }
    },
    [MUTATIONS_NAMES.setNetworkConfig](state, config) {
      if (config && new TypeChecker(config).isObject) {
        updateNetworkConifg(config)

        state[STATE_NAMES.networkConfig] = config
      }
    },
    [MUTATIONS_NAMES.setAddressFormat](state, addressFormat) {
      if (state.addressFormatItems.includes(addressFormat)) {
        if (state.addressFormat !== addressFormat) {
          updateStatic(state, true)
        }

        state.addressFormat = addressFormat
      }
    },
    [MUTATIONS_NAMES.setNetwork](state, network) {
      if ((network in state.networkConfig)) {
        if (state.network !== network) {
          setSelectedNetwork(network)
        }

        state.network = network
      }
    },
    [MUTATIONS_NAMES.setLockTime](state, time) {
      time = time.replace(' hours.', '')

      if (!isNaN(time)) {
        if (state.lockTime !== time) {
          updateStatic(state, true)
        }

        state.lockTime = time
      }
    },
    [MUTATIONS_NAMES.setGas](state, { gasPrice, gasLimit }) {
      if (gasPrice && gasLimit) {
        state.defaultGas = { gasPrice, gasLimit }
      }

      updateStatic(state, true)
    },
    [MUTATIONS_NAMES.setDefaultGas](state) {
      state.defaultGas = DEFAULT_GAS_FEE

      updateStatic(state, true)
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
    },
    async [ACTIONS_NAMES.onUpdateSettings]({ commit, state }) {
      const newState = await updateStatic(state)

      commit(MUTATIONS_NAMES.setGas, newState.defaultGas)
      commit(MUTATIONS_NAMES.setLockTime, newState.lockTime)
      commit(MUTATIONS_NAMES.setNetwork, newState.network)
      commit(MUTATIONS_NAMES.setAddressFormat, newState.addressFormat)
      commit(MUTATIONS_NAMES.setCurrency, newState.currency)
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
