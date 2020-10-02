/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import WalletStore from 'src/store/wallet'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = WalletStore.STORE

describe('store:wallet', () => {
  it('should have STORE object', () => {
    expect(WalletStore.STORE).toBeTruthy()
    expect(state).toBeTruthy()
    expect(namespaced).toBeTruthy()
    expect(mutations).toBeTruthy()
    expect(actions).toBeTruthy()
    expect(getters).toBeTruthy()
  })

  it('should have some propirties of state', () => {
    const keys = Object.keys(state)

    expect(keys.length).toBe(4)
  })

  it('test for inital state', () => {
    expect(state.isReady).toBeDefined()
    expect(state.isReady).toBeNull()

    expect(state.isEnable).toBeDefined()
    expect(state.isEnable).toBeNull()

    expect(state.networkStatus).toBeDefined()
    expect(state.networkStatus).toBeNull()

    expect(state.verifly).toBeDefined()
    expect(state.verifly).toBeNull()
  })

  it('should have some mutations', () => {
    const keys = Object.keys(mutations)

    expect(mutations.setAuth).toBeTruthy()
    expect(mutations.setVerifly).toBeTruthy()
    expect(mutations.setNetStatus).toBeTruthy()

    expect(keys.length).toBe(3)
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(actions.onInit).toBeTruthy()
    expect(actions.checkProvider).toBeTruthy()

    expect(keys.length).toBe(2)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(keys.length).toBe(0)
  })
})
