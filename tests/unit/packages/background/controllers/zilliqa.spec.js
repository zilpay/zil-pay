/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { v4 } from 'uuid'
import { Zilliqa } from 'packages/background/controllers/zilliqa'

describe('packages:controllers:Zilliqa', () => {
  it('Should import Zilliqa', () => {
    expect(Zilliqa).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Zilliqa()).toBeTruthy()
  })

  it('test constructor', () => {
    const payload = {
      uuid: v4()
    }
    const instance = new Zilliqa(payload)

    expect(instance.payload).toBeTruthy()
    expect(instance._storage).toBeTruthy()
    expect(instance.payload.uuid).toEqual(payload.uuid)
  })

  it('should be have static methods', () => {
    expect(Zilliqa.initInpage).toBeTruthy()
    expect(Zilliqa.rmAllTransactionList).toBeTruthy()
    expect(Zilliqa.addDefaultTokens).toBeTruthy()
  })

  it('should be have methods', () => {
    const instance = new Zilliqa({})

    expect(instance.getZRCTokenInfo).toBeTruthy()
    expect(instance.addZRCToken).toBeTruthy()
    expect(instance.toDefaulTokens).toBeTruthy()
    expect(instance.rmZRCToken).toBeTruthy()
    expect(instance.getMinGasPrice).toBeTruthy()
  })
})
