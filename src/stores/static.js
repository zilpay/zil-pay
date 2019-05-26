import networkConfig from '../../config/zil.json'


export default {
  namespaced: true,
  state: {
    currency: 'USD',
    currencyItems: ['BTC', 'ETH', 'TRX'],

    addressFormat: 'Bech32',
    addressFormatItems: ['Bech32', 'Base58', 'Hex'],

    network: 'mainnet',
    networkConfig,

    defaultGas: {
      gasPrice: 1000, // in LI
      gasLimit: 1
    }
  },
  mutations: {
    mutateGasLimit(state, newGasLimit) {
      state.defaultGas.gasLimit = newGasLimit;
    },
    mutateGasPrice(state, newGasPrice) {
      state.defaultGas.gasPrice = newGasPrice;
    },
    mutateCurrency(state, newMutateCurrency) {
      state.currency = newMutateCurrency;
    },
    mutateAddressFormat(state, newAddressFormat) {
      state.addressFormat = newAddressFormat;
    },
    mutateNetwork(state, newNetwork) {
      state.network = newNetwork;
    },
    mutateNetworkConfig(state, newConfig) {
      state.networkConfig = newConfig;
    },
    toDefaultNetworkConfig(state) {
      state.networkConfig = networkConfig;
    }
  },
  actions: {
    stateUpdate({ state }) {
      console.log(state);
    }
  }
}