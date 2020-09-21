/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { v4 } from 'uuid'
import { Popup } from 'packages/background/controllers/popup'

describe('packages:controllers:Popup', () => {
  it('Should import Popup', () => {
    expect(Popup).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Popup()).toBeTruthy()
  })

  it('amount of methods', () => {
    const propiriesNames = Object.getOwnPropertyNames(Popup.prototype)

    expect(propiriesNames.length).toBe(7)
  })

  it('test constructor', () => {
    const payload = {
      uuid: v4()
    }
    const instance = new Popup(payload)

    expect(instance.payload).toBeTruthy()
    expect(instance.payload.uuid).toEqual(payload.uuid)
  })

  it('should be have static methods', () => {
    expect(Popup.walletStatusUpdate).toBeTruthy()
    expect(Popup.logOut).toBeTruthy()
  })

  it('should be have methods', () => {
    const instance = new Popup({})

    expect(instance.initPopup).toBeTruthy()
    expect(instance.initWallet).toBeTruthy()
    expect(instance.walletUnlock).toBeTruthy()
    expect(instance.getRandomSeedPhrase).toBeTruthy()
    expect(instance.changeAccountName).toBeTruthy()
    expect(instance.setDataFromPopup).toBeTruthy()
  })
})
