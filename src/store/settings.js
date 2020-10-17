/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import fetch from 'cross-fetch'

import { DEFAULT, API, DEFAULT_TOKEN } from 'config'
import { TypeChecker } from 'lib/type'
import { ZILLIQA, DEFAULT_GAS_FEE } from 'config/zilliqa'
import { CURRENCIES, ADDRESS_FORMAT_VARIANTS } from '@/config'
import CalcMixin from '@/mixins/calc'

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
  currentRate: 'currentRate',
  blockNumber: 'blockNumber'
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
  setRemoveDappList: 'setRemoveDappList',
  setBlockNumber: 'setBlockNumber'
}
const ACTIONS_NAMES = {
  updateRate: 'updateRate',
  onUpdateNetworkConfig: 'onUpdateNetworkConfig',
  onUpdateSettings: 'onUpdateSettings',
  onUpdateConnection: 'onUpdateConnection',
  onUpdateDappList: 'onUpdateDappList',
  onGetMinGasPrice: 'onGetMinGasPrice',
  onUpdateSelectedNet: 'onUpdateSelectedNet',
  onUpdateTokensRate: 'onUpdateTokensRate'
}
const GETTERS_NAMES = {
  getCurrent: 'getCurrent',
  getHours: 'getHours',
  getRate: 'getRate',
  getDefaultRate: 'getDefaultRate'
}

const bg = new Background()

const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.lockTime]: DEFAULT.TIME_BEFORE_LOCK, // in hours.
    [STATE_NAMES.blockNumber]: 0,
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
      [DEFAULT_TOKEN.symbol]: {
        [CURRENCIES.BTC]: 0,
        [CURRENCIES.USD]: 0,
        [CURRENCIES.ETH]: 0
      }
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
    [MUTATIONS_NAMES.setBlockNumber](state, value) {
      const type = new TypeChecker(value)

      if (!type.isInt || value < 0) {
        return null
      }

      state[STATE_NAMES.blockNumber] = value
    },
    [MUTATIONS_NAMES.setNetworkConfig](state, config) {
      const type = new TypeChecker(config)

      if (!config || !type.isObject) {
        return null
      }

      state[STATE_NAMES.networkConfig] = {
        ...ZILLIQA,
        ...config
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
      const type = new TypeChecker(network)
      const keys = Object.keys(ZILLIQA)

      if (!type.isString || !keys.includes(network)) {
        return null
      }

      state.network = network
    },
    [MUTATIONS_NAMES.setLockTime](state, time) {
      const type = new TypeChecker(time)

      if (!type.isString && !type.isInt) {
        return null
      }

      if (type.isString) {
        time = time.replace(' hours.', '')
      }

      if (!isNaN(time)) {
        if (state.lockTime !== time) {
          updateStatic(state, true)
        }

        state.lockTime = time
      }
    },
    [MUTATIONS_NAMES.setGas](state, payload) {
      const type = new TypeChecker(payload)

      if (!payload || !type.isObject) {
        return null
      }

      if (payload.gasPrice) {
        state.defaultGas.gasPrice = payload.gasPrice
      }

      if (payload.gasLimit) {
        state.defaultGas.gasLimit = payload.gasLimit
      }

      updateStatic(state, true)
    },
    [MUTATIONS_NAMES.setDefaultGas](state) {
      state.defaultGas = DEFAULT_GAS_FEE

      updateStatic(state, true)
    },
    [MUTATIONS_NAMES.setRate](state, payload) {
      const type = new TypeChecker(payload)

      if (!payload || !type.isObject || type.isArray) {
        return null
      }

      const keys = Object.keys(payload)

      if (keys.length < 1) {
        return null
      }

      state[STATE_NAMES.currentRate] = payload
    },
    [MUTATIONS_NAMES.setConnect](state, payload) {
      const type = new TypeChecker(payload)

      if (!payload || !type.isObject || type.isArray) {
        return null
      }

      const keys = Object.keys(payload)

      if (keys.length === 0) {
        state[STATE_NAMES.connect] = payload

        return null
      }

      const requiredKeys = [
        'domain',
        'icon',
        'title',
        'uuid'
      ]

      for (let index = 0; index < requiredKeys.length; index++) {
        const key = requiredKeys[index]

        if (!keys.includes(key)) {
          return null
        }
      }

      state[STATE_NAMES.connect] = payload
    },
    [MUTATIONS_NAMES.setEmptyDappList](state) {
      state[STATE_NAMES.dappsList] = []

      updateStatic(state, true)
    },
    [MUTATIONS_NAMES.setDappList](state, data) {
      const type = new TypeChecker(data)

      if (!data || !type.isArray) {
        return null
      }

      state[STATE_NAMES.dappsList] = state[STATE_NAMES.dappsList].concat(data)
    },
    [MUTATIONS_NAMES.setRemoveDappList](state, item) {
      state[STATE_NAMES.dappsList] = state[STATE_NAMES.dappsList]
        .filter((el) => el.domain !== item.domain)

      updateStatic(state, true)
    }
  },
  actions: {
    async [ACTIONS_NAMES.onUpdateSelectedNet]({ commit }, selected) {
      commit(MUTATIONS_NAMES.setNetwork, selected)

      await setSelectedNetwork(selected)
    },
    async [ACTIONS_NAMES.onUpdateNetworkConfig]({ commit }, config) {
      commit(MUTATIONS_NAMES.setNetworkConfig, config)

      await updateNetworkConifg({
        ...ZILLIQA,
        ...config
      })
    },
    async [ACTIONS_NAMES.updateRate]({ commit }) {
      let rate = null
      const url = `${API.COIN_GECKO}?ids=zilliqa&vs_currencies=usd,btc,eth`

      try {
        const response = await fetch(url)

        rate = await response.json()

        rate = {
          [DEFAULT_TOKEN.symbol]: {
            USD: rate.zilliqa.usd,
            BTC: rate.zilliqa.btc,
            ETH: rate.zilliqa.eth
          }
        }
      } catch (err) {
        rate = {
          [DEFAULT_TOKEN.symbol]: {
            BTC: 0,
            USD: 0,
            ETH: 0
          }
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
    async [ACTIONS_NAMES.onGetMinGasPrice]({ state, commit }) {
      const gasPrice = await bg.getMinGasPrice()
      const gasPriceInLi = CalcMixin.methods.toLi(gasPrice)
      const gas = {
        ...state.defaultGas,
        gasPrice: gasPriceInLi
      }

      if (Number(gasPriceInLi) >= Number(state.defaultGas.gasPrice)) {
        commit(MUTATIONS_NAMES.setGas, gas)

        await updateStatic(state, true)
      }

      return gas
    },
    async [ACTIONS_NAMES.onUpdateDappList]({ state, commit }) {
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
    },
    async [ACTIONS_NAMES.onUpdateTokensRate]({ state, commit }) {
      const rates = await bg.getTokenRate()
      let currentRate = JSON.parse(JSON.stringify(state[STATE_NAMES.currentRate]))

      for (let index = 0; index < rates.length; index++) {
        const { symbol, exchangeRate } = rates[index]

        currentRate[symbol] = {
          [DEFAULT_TOKEN.symbol]: Number(exchangeRate)
        }
      }

      commit(MUTATIONS_NAMES.setRate, currentRate)

      return currentRate
    }
  },
  getters: {
    [GETTERS_NAMES.getRate]: (state, _, rootState) => {
      let currentCurrency = state[STATE_NAMES.currency]
      const { selectedcoin } = rootState.token

      if (selectedcoin !== DEFAULT_TOKEN.symbol) {
        currentCurrency = DEFAULT_TOKEN.symbol
      }

      try {
        return state[STATE_NAMES.currentRate][selectedcoin][currentCurrency]
      } catch (err) {
        return 0
      }
    },
    [GETTERS_NAMES.getDefaultRate](state) {
      const currentCurrency = state[STATE_NAMES.currency]

      try {
        return state[STATE_NAMES.currentRate][DEFAULT_TOKEN.symbol][currentCurrency]
      } catch (err) {
        return 0
      }
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
