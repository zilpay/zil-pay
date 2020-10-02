/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT } from 'config/default'
import { TypeChecker } from 'lib/type'
import { walletUpdate } from '@/services'

const STORE_NAME = 'accounts'
const STATE_NAMES = {
  identities: 'identities',
  selectedAddress: 'selectedAddress'
}
const MUTATIONS_NAMES = {
  setAccounts: 'setAccounts',
  setAccount: 'setAccount',
  setAccountName: 'setAccountName',
  setWallet: 'setWallet'
}
const ACTIONS_NAMES = {
  onRemoveAccount: 'onRemoveAccount',
  onAddAccount: 'onAddAccount'
}
const GETTERS_NAMES = {
  getCurrentAccount: 'getCurrentAccount'
}
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.identities]: [],
    [STATE_NAMES.selectedAddress]: 0
  },
  mutations: {
    [MUTATIONS_NAMES.setAccounts](state, identities) {
      if (!identities || identities.length < 1) {
        return null
      }

      state.identities = identities
    },
    [MUTATIONS_NAMES.setAccount](state, index) {
      if (!new TypeChecker(index).isInt || index > state.identities.length || index < 0) {
        return null
      }

      state.selectedAddress = index

      walletUpdate(state)
    },
    [MUTATIONS_NAMES.setAccountName](state, value) {
      if (!new TypeChecker(value).isString) {
        return null
      } else if (value.length > DEFAULT.MAX_LENGTH_NAME) {
        return null
      }

      const { identities, selectedAddress } = state

      identities[selectedAddress].name = value

      walletUpdate(state)
    },
    [MUTATIONS_NAMES.setWallet](state, wallet) {
      if (!wallet || !new TypeChecker(wallet.selectedAddress).isInt) {
        return null
      } else if (!wallet || !new TypeChecker(wallet.identities).isArray) {
        return null
      }

      state.identities = wallet.identities
      state.selectedAddress = wallet.selectedAddress
    }
  },
  actions: {
    [ACTIONS_NAMES.onRemoveAccount]({ state, commit }, index) {
      if (!new TypeChecker(index).isInt) {
        return null
      }

      const { identities, selectedAddress } = state

      if (selectedAddress === index || selectedAddress > index) {
        commit(MUTATIONS_NAMES.setAccount, selectedAddress - 1)
      }

      commit(MUTATIONS_NAMES.setAccounts, identities.filter((_, i) => i !== index))

      walletUpdate(state)
    },
    [ACTIONS_NAMES.onAddAccount]({ state, commit, rootState }, payload) {
      const type = new TypeChecker(payload)

      if (!type.isObject || type.isArray || type.isUndefined || !payload) {
        return null
      }

      const { identities } = state
      const unique = identities.some(acc => (payload && acc.address === payload.address))

      if (unique) {
        throw new Error(rootState.ui.local.MUST_BE_UNIQUE)
      }

      identities.push(payload)

      commit(MUTATIONS_NAMES.setAccount, identities.length - 1)
      commit(MUTATIONS_NAMES.setAccounts, identities)
    }
  },
  getters: {
    [GETTERS_NAMES.getCurrentAccount]: state => state.identities[state.selectedAddress]
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
