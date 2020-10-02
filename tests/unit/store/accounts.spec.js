/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import AccountStore from 'src/store/accounts'
import { v4 } from 'uuid'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = AccountStore.STORE

const actionProvider = {
  state,
  commit: (key, value) => {
    mutations[key](state, value)
  },
  rootState: {
    ui: {
      local: {
        MUST_BE_UNIQUE: v4()
      }
    }
  }
}

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

  it('try setAccounts of identities', () => {
    const identities = [{
      balance: '0',
      name: 'test',
      index: 0,
      address: v4()
    }]
    mutations.setAccounts(state, undefined)
    mutations.setAccounts(state, null)
    mutations.setAccounts(state, 0)
    mutations.setAccounts(state, '')

    expect(state.identities).toEqual([])

    mutations.setAccounts(state, identities)

    expect(state.identities).toEqual(identities)
    expect(getters.getCurrentAccount(state)).toEqual(identities[0])
  })

  it('try setAccount of selectedAddress', () => {
    const selectedAddress = 0

    mutations.setAccount(state, undefined)
    mutations.setAccount(state, null)
    mutations.setAccount(state, NaN)
    mutations.setAccount(state, '')
    mutations.setAccount(state, 99999)
    mutations.setAccount(state, -1)

    expect(state.selectedAddress).toBe(0)

    mutations.setAccount(state, selectedAddress)

    expect(state.selectedAddress).toBe(0)
  })

  it('try setAccountName of current account', () => {
    let name = v4()

    mutations.setAccountName(state, name)
    mutations.setAccountName(state, null)
    mutations.setAccountName(state, 0)
    mutations.setAccountName(state, undefined)

    expect(getters.getCurrentAccount(state).name).toEqual('test')

    name = name.slice(30)

    mutations.setAccountName(state, name)

    expect(getters.getCurrentAccount(state).name).toEqual(name)
  })

  it('try setWallet of selectedAddress, identities', () => {
    const selectedAddress = 2
    const identities = [
      {
        balance: '23',
        name: v4().slice(30),
        index: 0,
        address: v4()
      },
      {
        balance: '4423',
        index: 1,
        name: v4().slice(30),
        address: v4()
      },
      {
        balance: '0',
        index: 2,
        name: v4().slice(30),
        address: v4()
      }
    ]

    mutations.setWallet(state, {})
    mutations.setWallet(state, [])
    mutations.setWallet(state, null)
    mutations.setWallet(state, 0)
    mutations.setWallet(state, undefined)

    expect(state.identities).toBeTruthy()
    expect(state.selectedAddress).toBe(0)

    mutations.setWallet(state, {
      selectedAddress,
      identities
    })

    expect(state.selectedAddress).toBe(selectedAddress)
    expect(state.identities).toEqual(identities)

    expect(getters.getCurrentAccount(state)).toEqual(identities[selectedAddress])
  })

  it('try remove accounts', () => {
    actions.onRemoveAccount(actionProvider, 0)
    actions.onRemoveAccount(actionProvider, 1)
    actions.onRemoveAccount(actionProvider, 0)
    actions.onRemoveAccount(actionProvider, 0)

    expect(state.selectedAddress).toBe(0)
    expect(state.identities).toBeDefined()
  })

  it('try add account', () => {
    const newAccount = {
      balance: '0',
      name: v4().slice(30),
      index: 0,
      address: v4()
    }
    actions.onAddAccount(actionProvider, 0)
    actions.onAddAccount(actionProvider, [])
    actions.onAddAccount(actionProvider, '')
    actions.onAddAccount(actionProvider, null)
    actions.onAddAccount(actionProvider, undefined)

    expect(state.selectedAddress).toBe(0)
    expect(state.identities.length).toBe(1)

    actions.onAddAccount(actionProvider, newAccount)

    expect(state.selectedAddress).toBe(1)
    expect(state.identities.length).toBe(2)
    expect(getters.getCurrentAccount(state)).toEqual(newAccount)
  })
})
