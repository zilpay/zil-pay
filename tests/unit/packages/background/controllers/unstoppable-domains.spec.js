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

  it('amount of methods', () => {
    const propiriesNames = Object.getOwnPropertyNames(Domains.prototype)

    expect(propiriesNames.length).toBe(2)
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

  it('try get owner', async() => {
    const instance = new Domains({
      domain: 'zilpay.zil'
    })

    await instance.getUdOwnerByDomain((result) => {
      expect(result.resolve).toBeTruthy()
      expect(result.reject).toBeFalsy()

      expect(result.resolve.records).toBeTruthy()
      expect(result.resolve.owner).toBeTruthy()
      expect(result.resolve.domainHash).toBe('0x37a3ff9caf9da96c6972648495a045c315f4a91d5e2d545d0ff9f6d9ae7220a1')
      expect(result.resolve.domain).toBe(instance.payload.domain)
    })
  }, 9000)
})
