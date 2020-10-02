/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import AccountStore from 'src/store/accounts'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = AccountStore.STORE

describe('store:accounts', () => {
  it('should have STORE object', () => {
    expect(AccountStore.STORE).toBeTruthy()
    expect(state).toBeTruthy()
    expect(namespaced).toBeTruthy()
    expect(mutations).toBeTruthy()
    expect(actions).toBeTruthy()
    expect(getters).toBeTruthy()
  })

  it('should have some propirties of state', () => {
    const keys = Object.keys(state)

    expect(state.identities).toBeTruthy()
    expect(state.selectedAddress).not.toBeNaN()
    expect(Array.isArray(state.identities)).toBeTruthy()
    expect(keys.length).toBe(2)
  })

  it('should have some mutations', () => {
    const keys = Object.keys(mutations)

    expect(mutations.setAccounts).toBeTruthy()
    expect(mutations.setAccount).toBeTruthy()
    expect(mutations.setAccountName).toBeTruthy()
    expect(mutations.setWallet).toBeTruthy()
    expect(keys.length).toBe(4)
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(actions.onRemoveAccount).toBeTruthy()
    expect(actions.onAddAccount).toBeTruthy()
    expect(keys.length).toBe(2)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(getters.getCurrentAccount).toBeTruthy()
    expect(keys.length).toBe(1)
  })
})
