/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import { DEFAULT, ZILLIQA, DEFAULT_GAS_FEE, DEFAULT_TOKEN } from 'config'
import { CURRENCIES, ADDRESS_FORMAT_VARIANTS } from 'src/config'

import SettingsStore from 'src/store/settings'
import { v4 } from 'uuid'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = SettingsStore.STORE

const actionProvider = {
  state,
  commit: (key, value) => {
    mutations[key](state, value)
  }
}

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

    expect(keys.length).toBe(8)
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
    mutations.setCurrency(state, 0)
    mutations.setCurrency(state, '')
    mutations.setCurrency(state, null)
    mutations.setCurrency(state, undefined)

    expect(state.currency).toBe(CURRENCIES.USD)

    mutations.setCurrency(state, CURRENCIES.BTC)

    expect(state.currency).toBe(CURRENCIES.BTC)
  })

  it('try setBlockNumber', () => {
    mutations.setBlockNumber(state, null)
    mutations.setBlockNumber(state, '')
    mutations.setBlockNumber(state, undefined)
    mutations.setBlockNumber(state, -1)

    expect(state.blockNumber).toBe(0)

    mutations.setBlockNumber(state, 99)

    expect(state.blockNumber).toBe(99)
  })

  it('try setNetworkConfig', () => {
    mutations.setNetworkConfig(state, 0)
    mutations.setNetworkConfig(state, '')
    mutations.setNetworkConfig(state, null)
    mutations.setNetworkConfig(state, {})
    mutations.setNetworkConfig(state, [])
    mutations.setNetworkConfig(state, undefined)

    expect(state.networkConfig).toEqual(ZILLIQA)

    const modifiedConfig = {
      ...ZILLIQA,
      private: {
        ...ZILLIQA.private,
        PROVIDER: 'https://127.0.0.1:90'
      }
    }

    mutations.setNetworkConfig(state, modifiedConfig)

    expect(state.networkConfig).toEqual(modifiedConfig)
  })

  it('try setAddressFormat', () => {
    mutations.setAddressFormat(state, null)
    mutations.setAddressFormat(state, undefined)
    mutations.setAddressFormat(state, 0)
    mutations.setAddressFormat(state, [])
    mutations.setAddressFormat(state, {})
    mutations.setAddressFormat(state, '')

    expect(state.addressFormat).toBe(ADDRESS_FORMAT_VARIANTS.bech32)

    mutations.setAddressFormat(state, ADDRESS_FORMAT_VARIANTS.base16)

    expect(state.addressFormat).toBe(ADDRESS_FORMAT_VARIANTS.base16)
  })

  it('try setNetwork', () => {
    mutations.setNetwork(state, null)
    mutations.setNetwork(state, undefined)
    mutations.setNetwork(state, 0)
    mutations.setNetwork(state, {})
    mutations.setNetwork(state, [])
    mutations.setNetwork(state, '')

    expect(state.network).toBe(Object.keys(ZILLIQA)[0])

    mutations.setNetwork(state, Object.keys(ZILLIQA)[2])

    expect(state.network).toBe(Object.keys(ZILLIQA)[2])
  })

  it('try setLockTime', () => {
    mutations.setLockTime(state, null)
    mutations.setLockTime(state, undefined)
    mutations.setLockTime(state, {})
    mutations.setLockTime(state, [])

    expect(state.lockTime).toBe(DEFAULT.TIME_BEFORE_LOCK)

    mutations.setLockTime(state, 99)

    expect(state.lockTime).toBe(99)
  })

  it('try setGas', () => {
    mutations.setGas(state, [])
    mutations.setGas(state, {})
    mutations.setGas(state, null)
    mutations.setGas(state, undefined)
    mutations.setGas(state, 0)
    mutations.setGas(state, '')

    expect(state.defaultGas).toEqual(DEFAULT_GAS_FEE)

    const newDefaultGas = {
      gasPrice: 99,
      gasLimit: 190932423
    }

    mutations.setGas(state, newDefaultGas)

    expect(state.defaultGas).toEqual(newDefaultGas)
  })

  it('try setDefaultGas', () => {
    mutations.setDefaultGas(state)

    expect(state.defaultGas).toEqual(DEFAULT_GAS_FEE)
  })

  it('try setRate', () => {
    mutations.setRate(state, null)
    mutations.setRate(state, undefined)
    mutations.setRate(state, {})
    mutations.setRate(state, [])
    mutations.setRate(state, 0)
    mutations.setRate(state, '')

    expect(state.currentRate).toEqual({
      [DEFAULT_TOKEN.symbol]: {
        [CURRENCIES.BTC]: 0,
        [CURRENCIES.USD]: 0,
        [CURRENCIES.ETH]: 0
      }
    })

    const newRate = {
      [DEFAULT_TOKEN.symbol]: {
        [CURRENCIES.BTC]: 0.66,
        [CURRENCIES.USD]: 0.343,
        [CURRENCIES.ETH]: 0.43
      }
    }

    mutations.setRate(state, newRate)

    expect(state.currentRate).toEqual(newRate)
  })

  it('try setConnect', () => {
    mutations.setConnect(state, [])
    mutations.setConnect(state, 0)
    mutations.setConnect(state, null)
    mutations.setConnect(state, undefined)
    mutations.setConnect(state, {
      icon: v4(),
      title: v4().slice(30),
      uuid: v4()
    })

    expect(state.connect).toEqual({})

    const connected = {
      domain: 'zilpay.xyz',
      icon: v4(),
      title: v4().slice(30),
      uuid: v4()
    }

    mutations.setConnect(state, connected)

    expect(state.connect).toEqual(connected)

    mutations.setConnect(state, {})

    expect(state.connect).toEqual({})
  })

  it('try setDappList', () => {
    mutations.setDappList(state, null)
    mutations.setDappList(state, undefined)
    mutations.setDappList(state, 0)
    mutations.setDappList(state, '')

    expect(state.dappsList).toEqual([])

    const dappList = [
      {
        domain: v4(),
        icon: v4(),
        title: v4().slice(30)
      },
      {
        domain: v4(),
        icon: v4(),
        title: v4().slice(30)
      },
      {
        domain: v4(),
        icon: v4(),
        title: v4().slice(30)
      }
    ]

    mutations.setDappList(state, dappList)

    expect(state.dappsList).toEqual(dappList)
  })

  it('try setEmptyDappList', () => {
    mutations.setEmptyDappList(state)

    expect(state.dappsList).toEqual([])
  })

  // it('try onUpdateSelectedNet', () => {

  // })

  it('try onUpdateSelectedNet', async() => {
    try {
      await actions.onUpdateSelectedNet(actionProvider, '')
    } catch (err) {
      expect(state.network).toBe(Object.keys(ZILLIQA)[2])
    }

    try {
      await actions.onUpdateSelectedNet(actionProvider, [])
    } catch (err) {
      expect(state.network).toBe(Object.keys(ZILLIQA)[2])
    }

    try {
      await actions.onUpdateSelectedNet(actionProvider, {})
    } catch (err) {
      expect(state.network).toBe(Object.keys(ZILLIQA)[2])
    }

    try {
      await actions.onUpdateSelectedNet(actionProvider, 0)
    } catch (err) {
      expect(state.network).toBe(Object.keys(ZILLIQA)[2])
    }
  })
})
