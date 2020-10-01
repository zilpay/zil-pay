/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */

import 'tests/extension-sinnon'
import { v4 } from 'uuid'
import { ZILLIQA } from 'config'
import { Network } from 'packages/background/controllers/network'

describe('packages:controllers:Network', () => {
  it('Should import Network', () => {
    expect(Network).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Network()).toBeTruthy()
  })

  it('amount of methods', () => {
    const propiriesNames = Object.getOwnPropertyNames(Network.prototype)

    expect(propiriesNames.length).toBe(2)
  })

  it('test constructor', () => {
    const payload = {
      uuid: v4()
    }
    const instance = new Network(payload)

    expect(instance.payload).toBeTruthy()
    expect(instance.payload.uuid).toEqual(payload.uuid)
  })

  it('should be have methods', () => {
    const instance = new Network({})

    expect(instance.changeNetwork).toBeTruthy()
  })

  it('try change wrong netwrok', () => {
    const instance = new Network({
      selectednet: v4()
    })

    instance.changeNetwork((selectednet) => {
      expect(selectednet.resolve).toBeFalsy()
      expect(selectednet.reject).toBe(`selected ${instance.payload.selectednet} is not ${Object.keys(ZILLIQA)}`)
    })
  })

  it('try change netwrok', () => {
    const instance = new Network({
      selectednet: Object.keys(ZILLIQA)[0]
    })

    instance.changeNetwork((selectednet) => {
      expect(selectednet.resolve).toBe(Object.keys(ZILLIQA)[0])
    })
  })
})
