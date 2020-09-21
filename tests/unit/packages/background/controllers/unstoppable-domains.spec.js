/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { v4 } from 'uuid'
import { Domains } from 'packages/background/controllers/unstoppable-domains'

describe('packages:controllers:Domains', () => {
  it('Should import Domains', () => {
    expect(Domains).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Domains()).toBeTruthy()
  })

  it('test constructor', () => {
    const payload = {
      domain: v4()
    }
    const instance = new Domains(payload)

    expect(instance.payload).toBeTruthy()
    expect(instance.payload.domain).toEqual(payload.domain)
  })

  it('should be have methods', () => {
    const instance = new Domains({})

    expect(instance.getUdOwnerByDomain).toBeTruthy()
  })
})
