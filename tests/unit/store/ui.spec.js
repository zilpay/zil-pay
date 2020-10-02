/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { CURRENCIES } from 'src/config'

import UIStore from 'src/store/ui'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = UIStore.STORE

describe('store:ui', () => {
  it('should have STORE object', () => {
    expect(UIStore.STORE).toBeTruthy()
    expect(state).toBeTruthy()
    expect(namespaced).toBeTruthy()
    expect(mutations).toBeTruthy()
    expect(actions).toBeTruthy()
    expect(getters).toBeTruthy()
  })

  it('should have some propirties of state', () => {
    const keys = Object.keys(state)

    expect(keys.length).toBe(7)
  })

  it('test for inital state', () => {
    expect(state.loading).toBeFalsy()
    expect(state.isConnect).toBeTruthy()
    expect(state.conversionRate).toEqual({
      [CURRENCIES.BTC]: 0,
      [CURRENCIES.USD]: 0
    })
    expect(state.selectedTheme).toBe('light')
    expect(state.themes).toEqual([ 'auto', 'light', 'dark' ])
    expect(state.local).toEqual({})
    expect(state.currentLocal).toBe('en')
  })

  it('should have some mutations', () => {
    const keys = Object.keys(mutations)

    expect(mutations.setTheme).toBeTruthy()
    expect(mutations.setLocal).toBeTruthy()
    expect(mutations.setLoad).toBeTruthy()

    expect(keys.length).toBe(3)
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(actions.onLocal).toBeTruthy()

    expect(keys.length).toBe(1)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(keys.length).toBe(0)
  })
})
