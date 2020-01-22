import { DEFAULT } from '../../config/default'
import { ZILLIQA } from '../../config/zilliqa'

export default {
  namespaced: true,
  state: {
    lockTime: DEFAULT.TIME_BEFORE_LOCK, // in hours.
    currency: 'USD',
    currencyItems: ['BTC', 'USD', 'ETH'],

    addressFormat: 'Bech32',
    addressFormatItems: ['Bech32', 'Base16'],

    network: 'mainnet',
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
