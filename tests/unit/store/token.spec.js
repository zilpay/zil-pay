/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { ZILLIQA, DEFAULT_TOKEN } from 'config'

import TokenStore from 'src/store/token'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = TokenStore.STORE

describe('store:token', () => {
  it('should have STORE object', () => {
    expect(TokenStore.STORE).toBeTruthy()
    expect(state).toBeTruthy()
    expect(namespaced).toBeTruthy()
    expect(mutations).toBeTruthy()
    expect(actions).toBeTruthy()
    expect(getters).toBeTruthy()
  })

  it('should have some propirties of state', () => {
    const keys = Object.keys(state)

    expect(keys.length).toBe(2)
  })

  it('test for inital state', () => {
    const keys = Object.keys(ZILLIQA)

    expect(state.tokens).toEqual({
      [keys[0]]: [DEFAULT_TOKEN],
      [keys[1]]: [DEFAULT_TOKEN],
      [keys[2]]: [DEFAULT_TOKEN]
    })
    expect(state.selectedcoin).toBe(DEFAULT_TOKEN.symbol)
  })

  it('should have some mutations', () => {
    const keys = Object.keys(mutations)

    expect(mutations.setSelectedCoin).toBeTruthy()
    expect(mutations.setTokens).toBeTruthy()

    expect(keys.length).toBe(2)
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(actions.onUpdateTokensStore).toBeTruthy()
    expect(actions.onAddToken).toBeTruthy()
    expect(actions.onSelectToken).toBeTruthy()
    expect(actions.onBalanceUpdate).toBeTruthy()
    expect(actions.onRemoveToken).toBeTruthy()

    expect(keys.length).toBe(5)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(getters.getSelectedToken).toBeTruthy()
    expect(getters.getDefaultToken).toBeTruthy()
    expect(getters.getTokenList).toBeTruthy()

    expect(keys.length).toBe(3)
  })
})
