/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { units, BN } from '@zilliqa-js/util'

export default {
  namespaced: true,
  state: {
    transactions: {},
    confirmationTx: [
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
    setCurrentGas(state, gas) {
      if (!gas || !gas.gasPrice || !gas.gasLimit) {
        return null
      }

      const { gasPrice, gasLimit } = gas

      state.confirmationTx[0].gasPrice = units.toQa(
        gasPrice, units.Units.Li
      ).toString()
      state.confirmationTx[0].gasLimit = gasLimit
    }
  },
  actions: {},
  getters: {
    getCurrent(state) {
      return state.confirmationTx[0]
    },
    getCurrentGas(state) {
      const gasPrice = units.fromQa(
        new BN(state.confirmationTx[0].gasPrice), units.Units.Li
      ).toString()

      return {
        gasPrice,
        gasLimit: state.confirmationTx[0].gasLimit
      }
    }
  }
}
