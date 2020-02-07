/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT } from '../../config/default'
import { ZILLIQA, DEFAULT_GAS_FEE } from '../../config/zilliqa'
import { CURRENCIES, ADDRESS_FORMAT_VARIANTS } from '@/config'

const STORE_NAME = 'contacts'
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
  connect: 'connect'
}
const MUTATIONS_NAMES = {
  setCurrency: 'setCurrency',
  setAddressFormat: 'setAddressFormat',
  setNetwork: 'setNetwork',
  setLockTime: 'setLockTime',
  setGas: 'setGas',
  setDefaultGas: 'setDefaultGas'
}
const ACTIONS_NAMES = { }
const GETTERS_NAMES = {
  getCurrent: 'getCurrent',
  getHours: 'getHours'
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
    [STATE_NAMES.connect]: {}
  },
  mutations: {
    [MUTATIONS_NAMES.setCurrency](state, currency) {
      if (state.currencyItems.includes(currency)) {
        state.currency = currency
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
    }
  },
  actions: {},
  getters: {
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
