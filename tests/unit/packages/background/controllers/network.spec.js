/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { v4 } from 'uuid'
import { Network } from 'packages/background/controllers/network'

describe('packages:controllers:Network', () => {
  it('Should import Network', () => {
    expect(Network).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Network()).toBeTruthy()
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
})
