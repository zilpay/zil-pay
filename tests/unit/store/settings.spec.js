/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT, ZILLIQA, DEFAULT_GAS_FEE, DEFAULT_TOKEN } from 'config'
import { CURRENCIES, ADDRESS_FORMAT_VARIANTS } from 'src/config'

import SettingsStore from 'src/store/settings'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = SettingsStore.STORE

describe('store:settings', () => {
  it('should have STORE object', () => {
    expect(SettingsStore.STORE).toBeTruthy()
    expect(state).toBeTruthy()
    expect(namespaced).toBeTruthy()
    expect(mutations).toBeTruthy()
    expect(actions).toBeTruthy()
    expect(getters).toBeTruthy()
  })

  it('should have some propirties of state', () => {
    const keys = Object.keys(state)

    expect(keys.length).toBe(12)
  })

  it('test for inital state', () => {
    expect(state.lockTime).toBe(DEFAULT.TIME_BEFORE_LOCK)
    expect(state.blockNumber).toBe(0)
    expect(state.currency).toBe(CURRENCIES.USD)
    expect(state.currencyItems).toEqual([
      CURRENCIES.BTC,
      CURRENCIES.USD,
      CURRENCIES.ETH
    ])
    expect(state.addressFormat).toBe(ADDRESS_FORMAT_VARIANTS.bech32)
    expect(state.addressFormatItems).toEqual([
      ADDRESS_FORMAT_VARIANTS.bech32,
      ADDRESS_FORMAT_VARIANTS.base16
    ])
    expect(state.network).toBe(Object.keys(ZILLIQA)[0])
    expect(state.networkConfig).toEqual(ZILLIQA)
    expect(state.defaultGas).toEqual(DEFAULT_GAS_FEE)
    expect(state.dappsList).toEqual([])
    expect(state.connect).toEqual({})
    expect(state.currentRate).toEqual({
      [DEFAULT_TOKEN.symbol]: {
        [CURRENCIES.BTC]: 0,
        [CURRENCIES.USD]: 0,
        [CURRENCIES.ETH]: 0
      }
    })
  })

  it('should have some mutations', () => {
    const keys = Object.keys(mutations)

    expect(mutations.setCurrency).toBeTruthy()
    expect(mutations.setBlockNumber).toBeTruthy()
    expect(mutations.setNetworkConfig).toBeTruthy()
    expect(mutations.setAddressFormat).toBeTruthy()
    expect(mutations.setNetwork).toBeTruthy()
    expect(mutations.setLockTime).toBeTruthy()
    expect(mutations.setGas).toBeTruthy()
    expect(mutations.setDefaultGas).toBeTruthy()
    expect(mutations.setRate).toBeTruthy()
    expect(mutations.setConnect).toBeTruthy()
    expect(mutations.setEmptyDappList).toBeTruthy()
    expect(mutations.setDappList).toBeTruthy()
    expect(mutations.setRemoveDappList).toBeTruthy()

    expect(keys.length).toBe(13)
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(actions.onUpdateSelectedNet).toBeTruthy()
    expect(actions.onUpdateNetworkConfig).toBeTruthy()
    expect(actions.updateRate).toBeTruthy()
    expect(actions.onUpdateSettings).toBeTruthy()
    expect(actions.onUpdateConnection).toBeTruthy()
    expect(actions.onGetMinGasPrice).toBeTruthy()
    expect(actions.onUpdateDappList).toBeTruthy()

    expect(keys.length).toBe(7)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(getters.getRate).toBeTruthy()
    expect(getters.getDefaultRate).toBeTruthy()
    expect(getters.getCurrent).toBeTruthy()
    expect(getters.getHours).toBeTruthy()

    expect(keys.length).toBe(4)
  })


  it('try setCurrency', () => {
  })

  it('try setBlockNumber', () => {
  })

  it('try setNetworkConfig', () => {
  })

  it('try setAddressFormat', () => {
  })

  it('try setNetwork', () => {
  })

  it('try setLockTime', () => {
  })

  it('try setGas', () => {
  })

  it('try setDefaultGas', () => {
  })

  it('try setRate', () => {
  })

  it('try setConnect', () => {
  })

  it('try setEmptyDappList', () => {
  })

  it('try setDappList', () => {
  })

  it('try setRemoveDappList', () => {
  })
})
