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
import { TypeChecker } from 'lib/type'
import { ZILLIQA, DEFAULT_GAS_FEE } from 'config/zilliqa'
import { CURRENCIES, ADDRESS_FORMAT_VARIANTS } from '@/config'

import {
  setSelectedNetwork,
  updateStatic,
  updateNetworkConifg,
  getConnect,
  removeConnect,
  Background
} from '@/services'

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
  setNetworkConfig: 'setNetworkConfig',
  setConnect: 'setConnect',
  setDappList: 'setDappList',
  setEmptyDappList: 'setEmptyDappList',
  setRemoveDappList: 'setRemoveDappList'
}
const ACTIONS_NAMES = {
  updateRate: 'updateRate',
  onUpdateSettings: 'onUpdateSettings',
  onUpdateConnection: 'onUpdateConnection',
  onUpdateDappList: 'onUpdateDappList'
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
      CURRENCIES.USD,
      CURRENCIES.ETH
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
      if (config && new TypeChecker(config).isObject && Object.keys(config).length > 1) {
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
      if (new TypeChecker(time).isString) {
        time = time.replace(' hours.', '')
      }

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
    },
    [MUTATIONS_NAMES.setConnect](state, payload) {
      if (!payload || !new TypeChecker(payload).isObject) {
        return null
      }

      state[STATE_NAMES.connect] = payload
    },
    [MUTATIONS_NAMES.setEmptyDappList](state) {
      state[STATE_NAMES.dappsList] = []

      updateStatic(state, true)
    },
    [MUTATIONS_NAMES.setDappList](state, data) {
      state[STATE_NAMES.dappsList] = state[STATE_NAMES.dappsList].concat(data)
    },
    [MUTATIONS_NAMES.setRemoveDappList](state, item) {
      state[STATE_NAMES.dappsList] = state[STATE_NAMES.dappsList]
        .filter((el) => el.domain !== item.domain)
      updateStatic(state, true)
    }
  },
  actions: {
    async [ACTIONS_NAMES.updateRate]({ commit }) {
      let rate = null
      const url = `${API.COIN_GECKO}?ids=zilliqa&vs_currencies=usd,btc,eth`

      try {
        const response = await fetch(url)

        rate = await response.json()

        rate = {
          USD: rate.zilliqa.usd,
          BTC: rate.zilliqa.btc,
          ETH: rate.zilliqa.eth
        }
      } catch (err) {
        rate = {
          BTC: 0,
          USD: 0,
          ETH: 0
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
    },
    async [ACTIONS_NAMES.onUpdateConnection]({ commit }) {
      const connection = await getConnect()

      commit(MUTATIONS_NAMES.setConnect, connection)
    },
    async [ACTIONS_NAMES.onUpdateDappList]({ state, commit }) {
      const bg = new Background()
      const currentConnect = state[STATE_NAMES.connect]
      const currentList = state[STATE_NAMES.dappsList]

      await removeConnect()

      for (let index = 0; index < currentList.length; index++) {
        if (currentList[index].domain === currentConnect.domain) {
          return null
        }
      }

      await bg.sendResponseConnection(true, currentConnect.uuid)

      delete currentConnect.uuid

      currentList.push(currentConnect)

      await updateStatic(state, true)

      commit(MUTATIONS_NAMES.setDappList, currentList)
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
