/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'
import { v4, v1 } from 'uuid'
import { FIELDS } from 'config'
import { BrowserStorage } from 'lib/storage'
import { Popup } from 'packages/background/controllers/popup'
import { generateMnemonic } from 'bip39'
import { Wallet } from '@zilliqa-js/account'

const SEED = generateMnemonic(128)
const PASSWORD = v4()
const storage = new BrowserStorage()

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

  it('try init Wallet', async() => {
    const instance = new Popup({
      seed: SEED,
      password: PASSWORD
    })
    const wallet = new Wallet()

    wallet.addByMnemonic(SEED, 0)

    await instance.initWallet((result) => {
      expect(result.reject).toBeFalsy()
      expect(result.resolve).toBeTruthy()
      expect(result.resolve).toEqual({
        selectedAddress: 0,
        identities: [{
          address: wallet.defaultAccount.address,
          balance: '0',
          index: 0
        }]
      })
    })
  })

  it('try init Popup', async() => {
    const instance = new Popup({})

    await instance.initPopup((result) => {
      expect(result.reject).toBeFalsy()
      expect(result.resolve).toBeTruthy()
      expect(result.resolve.isReady).toBeTruthy()
      expect(result.resolve.isEnable).toBeTruthy()
    })
  })

  it('try logOut', async() => {
    await Popup.logOut((result) => {
      expect(result).toBeTruthy()
    })
  })

  it('check logout', async() => {
    const instance = new Popup({})

    await instance.initPopup((result) => {
      expect(result.reject).toBeFalsy()
      expect(result.resolve).toBeTruthy()
      expect(result.resolve.isReady).toBeTruthy()
      expect(result.resolve.isEnable).toBeFalsy()
    })
  })

  it('try unlock wallet', async() => {
    const instance = new Popup({
      password: PASSWORD
    })

    await instance.walletUnlock((result) => {
      expect(result.reject).toBeFalsy()
      expect(result.resolve).toBeTruthy()
    })
  })

  it('check unlock', async() => {
    const instance = new Popup({})

    await instance.initPopup((result) => {
      expect(result.reject).toBeFalsy()
      expect(result.resolve).toBeTruthy()
      expect(result.resolve.isReady).toBeTruthy()
      expect(result.resolve.isEnable).toBeTruthy()
    })
  })

  it('try change name of selected account', async() => {
    const instance = new Popup({
      name: v1().slice(30)
    })

    await instance.changeAccountName(async(result) => {
      expect(result.reject).toBeFalsy()
      expect(result.resolve).toBeTruthy()

      const wallet = await storage.get(FIELDS.WALLET)
      const selected = wallet.identities[wallet.selectedAddress]

      expect(selected.name).toBe(instance.payload.name)
    })
  })

})
