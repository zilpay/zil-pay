/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { units, BN } from '@zilliqa-js/util'

const STORE_NAME = 'transactions'
const STATE_NAMES = {
  transactions: 'transactions',
  confirmationTx: 'confirmationTx'
}
const MUTATIONS_NAMES = {
  setCurrentGas: 'setCurrentGas'
}
const ACTIONS_NAMES = { }
const GETTERS_NAMES = {
  getCurrent: 'getCurrent',
  getCurrentGas: 'getCurrentGas',
  getCurrentTransactions: 'getCurrentTransactions'
}

const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.transactions]: {
      '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F': {
        mainnet: [
          {
            Info: 'Contract Txn, Shards Match of the sender and reciever',
            TranID: '8bd99abe0f280d5df9fd515eadd93870902ecf5a5c661cfc37bca22fc657f5fd',
            amount: '10000000000000',
            nonce: 55,
            toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
            status: 'confirmed',
            epoch: '113232'
          },
          {
            Info: '',
            TranID: 'aaf3ef4c1e5135ac112d55082d97c9c235385bf567c9005e0fc82cbfcd735730',
            amount: '1000000000000',
            nonce: 52,
            toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
            status: 'rejected',
            epoch: '113233'
          },
          {
            Info: 'Contract Creation',
            TranID: 'aaf3ef4c1e5135ac112d55082d27c9c235385bf517c9005e0fc82cbfcd735730',
            amount: '23000000000000',
            nonce: 56,
            toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
            status: 'mining',
            epoch: '32432'
          }
        ]
      }
    },
    [STATE_NAMES.confirmationTx]: [
      {
        amount: '100000000000000',
        code: '',
        data: '{"_tag":"Roll","params":[{"vname":"rol","type":"Uint128","value":"50"}]}',
        domain: 'zilpay.xyz',
        gasLimit: '9000',
        gasPrice: '1000000000',
        // eslint-disable-next-line max-len
        icon: 'https://dappreview.oss-cn-hangzhou.aliyuncs.com/dappLogo/11729/rocketgame.vip/AXd8XwDdCibdyfF7bjJQDfKmTsEnpr3Q.png?x-oss-process=style/dapp-logo',
        isBroadcast: false,
        title: 'ZilPay',
        toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
        uuid: '607c800b-10a4-4b47-ad04-0bd78090f227',
        version: 0
      }
    ]
  },
  mutations: {
    [MUTATIONS_NAMES.setCurrentGas](state, gas) {
      if (!gas || !gas.gasPrice || !gas.gasLimit) {
        return null
      }

      const { gasPrice, gasLimit } = gas
      const gasInQa = units.toQa(gasPrice, units.Units.Li)

      state[STATE_NAMES.confirmationTx][0].gasPrice = String(gasInQa)
      state[STATE_NAMES.confirmationTx][0].gasLimit = gasLimit
    }
  },
  actions: {},
  getters: {
    [GETTERS_NAMES.getCurrent](state) {
      return state.confirmationTx[0]
    },
    [GETTERS_NAMES.getCurrentGas](state) {
      const gasPrice = units.fromQa(
        new BN(state.confirmationTx[0].gasPrice), units.Units.Li
      ).toString()

      return {
        gasPrice,
        gasLimit: state.confirmationTx[0].gasLimit
      }
    },
    [GETTERS_NAMES.getCurrentTransactions](state, _, rootState, rootGetters) {
      try {
        const { address } = rootGetters['accounts/getCurrentAccount']
        const { network } = rootState.settings

        return state.transactions[address][network] || []
      } catch (err) {
        return []
      }
    }
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
