/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { v4 } from 'uuid'
import { Wallet } from 'packages/background/controllers/wallet'

describe('packages:controllers:Wallet', () => {
  it('Should import Wallet', () => {
    expect(Wallet).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Wallet()).toBeTruthy()
  })

  it('amount of methods', () => {
    const propiriesNames = Object.getOwnPropertyNames(Wallet.prototype)

    expect(propiriesNames.length).toBe(12)
  })

  it('test constructor', () => {
    const payload = {
      uuid: v4()
    }
    const instance = new Wallet(payload)

    expect(instance.payload).toBeTruthy()
    expect(instance.payload.uuid).toEqual(payload.uuid)
  })

  it('should be have methods', () => {
    const instance = new Wallet({})

    expect(instance.confirmSignMsg).toBeTruthy()
    expect(instance.exportPrivateKey).toBeTruthy()
    expect(instance.exportSeedPhrase).toBeTruthy()
    expect(instance.importPrivateKey).toBeTruthy()
    expect(instance.importKeyStore).toBeTruthy()
    expect(instance.createAccountBySeed).toBeTruthy()
    expect(instance.changeWallet).toBeTruthy()
    expect(instance.balanceUpdate).toBeTruthy()
    expect(instance.connectToDapp).toBeTruthy()
    expect(instance.isConnectionDapp).toBeTruthy()
    expect(instance.signMessage).toBeTruthy()
  })
})
