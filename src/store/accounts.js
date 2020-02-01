/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT } from '../../config/default'

export default {
  namespaced: true,
  state: {
    identities: [
      {
        address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F',
        balance: '463851500000000',
        index: 0,
        name: 'Account 0'
      },
      {
        address: '0xF59eCFE8e1844C7708e55750057669db8cAE46a4',
        balance: '1500000000',
        hwType: 'ledger',
        index: '5',
        name: 'Ledger 5',
        pubKey: '0357d1d720b1987a8093588259158e055cdaf0f1b7c10758e83b9580bdba423a32'
      },
      {
        address: '0xEa442d03947cEa05b18c666f178D617D909D1F92',
        balance: '463851500000000',
        index: 2,
        name: 'Account 1'
      },
      {
        address: '0x6e54F8dB8B876803aB55259E14d157e0326B2Db4',
        balance: '463851500000000',
        index: 3,
        name: 'Account 2'
      }
    ],
    selectedAddress: 0
  },
  mutations: {
    setAccount(state, index) {
      if (isNaN(index) || index > state.identities || index < 0) {
        return null
      }

      state.selectedAddress = index
    },
    setAccountName(state, value) {
      if (typeof value !== 'string' || value.length > DEFAULT.MAX_LENGTH_NAME) {
        return null
      }

      const { identities, selectedAddress } = state

      identities[selectedAddress].name = value
    }
  },
  actions: {},
  getters: {
    getCurrentAccount: state => state.identities[state.selectedAddress]
  }
}
