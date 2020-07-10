/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT_TOKEN, ZILLIQA } from 'config'
import {
  getTokens,
  setSelectedCoin,
  Background
} from '@/services'

const keys = Object.keys(ZILLIQA)
const STORE_NAME = 'token'
const STATE_NAMES = {
  tokens: 'tokens',
  selectedcoin: 'selectedcoin'
}
const MUTATIONS_NAMES = {
  setTokens: 'setTokens',
  setSelectedCoin: 'setSelectedCoin'
}
const ACTIONS_NAMES = {
  onUpdateTokensStore: 'onUpdateTokensStore',
  onAddToken: 'onAddToken',
  onSelectToken: 'onSelectToken',
  onBalanceUpdate: 'onBalanceUpdate',
  onRemoveToken: 'onRemoveToken'
}
const GETTERS_NAMES = {
  getSelectedToken: 'getSelectedToken',
  getDefaultToken: 'getDefaultToken',
  getTokenList: 'getTokenList'
}
const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.tokens]: {
      [keys[0]]: [DEFAULT_TOKEN],
      [keys[1]]: [DEFAULT_TOKEN],
      [keys[2]]: [DEFAULT_TOKEN]
    },
    [STATE_NAMES.selectedcoin]: DEFAULT_TOKEN.symbol
  },
  mutations: {
    [MUTATIONS_NAMES.setSelectedCoin](state, value) {
      state[STATE_NAMES.selectedcoin] = value
    },
    [MUTATIONS_NAMES.setTokens](state, values) {
      state[STATE_NAMES.tokens] = values
    }
  },
  actions: {
    async [ACTIONS_NAMES.onUpdateTokensStore]({ commit, state }) {
      const items = await getTokens()
      const tokens = state[STATE_NAMES.tokens]

      if (!items || !items.tokens || items.tokens.length === 0) {
        return null
      }

      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        tokens[key] = [DEFAULT_TOKEN, ...items[STATE_NAMES.tokens][key]]
      }

      commit(MUTATIONS_NAMES.setTokens, tokens)
      commit(MUTATIONS_NAMES.setSelectedCoin, items[STATE_NAMES.selectedcoin])

      return items
    },
    async [ACTIONS_NAMES.onAddToken]({ commit, state }, address) {
      const bg = new Background()
      const data = await bg.setToken(address)
      const tokens = state[STATE_NAMES.tokens]

      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        tokens[key] = [DEFAULT_TOKEN, ...data[STATE_NAMES.tokens][key]]
      }

      commit(MUTATIONS_NAMES.setTokens, tokens)
      commit(MUTATIONS_NAMES.setSelectedCoin, data[STATE_NAMES.selectedcoin])

      return data
    },
    async [ACTIONS_NAMES.onSelectToken]({ commit }, symbol) {
      await setSelectedCoin(symbol)

      commit(MUTATIONS_NAMES.setSelectedCoin, symbol)
    },
    async [ACTIONS_NAMES.onBalanceUpdate]({ commit, state }) {
      const bg = new Background()
      const tokensState = state[STATE_NAMES.tokens]
      const { tokens, wallet } = await bg.balanceUpdate()

      if (!tokens || tokens.length === 0) {
        return null
      }

      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        tokensState[key] = [DEFAULT_TOKEN].concat(tokens[key])
      }

      commit(MUTATIONS_NAMES.setTokens, tokensState)

      return wallet
    },
    async [ACTIONS_NAMES.onRemoveToken]({ state, commit }, token) {
      const bg = new Background()
      const items = await bg.removeToken(token.symbol)
      const tokens = state[STATE_NAMES.tokens]

      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        tokens[key] = [DEFAULT_TOKEN, ...items.tokens[key]]
      }

      commit(MUTATIONS_NAMES.setTokens, tokens)
      commit(MUTATIONS_NAMES.setSelectedCoin, items[STATE_NAMES.selectedcoin])

      return items
    }
  },
  getters: {
    [GETTERS_NAMES.getSelectedToken](state, _, rootState) {
      const { tokens, selectedcoin } = state
      const { network } = rootState.settings
      const foundToken = tokens[network].find((t) => t.symbol === selectedcoin)

      if (!foundToken) {
        return DEFAULT_TOKEN
      }

      return foundToken
    },
    [GETTERS_NAMES.getDefaultToken]() {
      return DEFAULT_TOKEN
    },
    [GETTERS_NAMES.getTokenList](state, _, rootState) {
      const { tokens } = state
      const { network } = rootState.settings

      return tokens[network].map((el) => {
        if (el.symbol === DEFAULT_TOKEN.symbol) {
          const { identities, selectedAddress } = rootState.accounts
          const currentAccount = identities[selectedAddress]

          if (!currentAccount) {
            return el
          }

          el.balance = currentAccount.balance
        }

        return el
      })
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
