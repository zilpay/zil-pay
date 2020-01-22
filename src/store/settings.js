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
  mutations: {},
  actions: {},
  getters: {}
}
