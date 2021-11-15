/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import TransactionsStore from 'src/store/transactions'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = TransactionsStore.STORE

describe('store:transactions', () => {
  it('should have STORE object', () => {
    expect(TransactionsStore.STORE).toBeTruthy()
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
    expect(state.transactions).toEqual({})
    expect(state.confirmationTx).toEqual([])
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(actions.onUpdateTransactions).toBeTruthy()
    expect(actions.onUpdateToConfirmTxs).toBeTruthy()
    expect(actions.setRejectedLastTx).toBeTruthy()

    expect(keys.length).toBe(4)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(getters.getCurrent).toBeTruthy()
    expect(getters.getCurrentGas).toBeTruthy()
    expect(getters.getCurrentTransactions).toBeTruthy()

    expect(keys.length).toBe(3)
  })
})
