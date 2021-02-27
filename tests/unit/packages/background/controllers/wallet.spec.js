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
import { Wallet } from 'packages/background/controllers/wallet'
import { schnorr } from '@zilliqa-js/crypto'
import { Wallet as ZilliqaWallet } from '@zilliqa-js/account'
import { Popup } from 'packages/background/controllers/popup'
import { generateMnemonic } from 'bip39'

const SEED = generateMnemonic(128)
const PRIVATE_KEY = schnorr.generatePrivateKey()
const PASSWORD = v4()

describe('packages:controllers:Wallet', () => {

  it('Should import Wallet', () => {
    expect(Wallet).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Wallet()).toBeTruthy()
  })

  it('amount of methods', () => {
    const propiriesNames = Object.getOwnPropertyNames(Wallet.prototype)

    expect(propiriesNames.length).toBe(13)
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

  it('try export privateKey', async() => {
    await new Popup({
      seed: SEED,
      password: PASSWORD
    }).initWallet(async() => null)

    const wallet = new ZilliqaWallet()
    const instance = new Wallet({
      password: PASSWORD
    })

    wallet.addByMnemonic(SEED, 0)

    return await instance.exportPrivateKey((result) => {
      if (!result.resolve) {
        return null
      }

      expect(result.resolve).toBeTruthy()

      expect(result.resolve.index).toBeTruthy()
      expect(result.resolve.index).toBe(0)

      expect(result.resolve.privateKey).toBe(wallet.defaultAccount.privateKey)
      expect(result.resolve.keystore).toBeTruthy()
    })
  }, 20000)

  it('try export inital phrase', async() => {
    const instance = new Wallet({
      password: PASSWORD
    })

    await instance.exportSeedPhrase((result) => {
      expect(result.resolve).toBeTruthy()
      expect(result.resolve).toBe(SEED)
    })
  })

  it('try export inital phrase', async() => {
    const instance = new Wallet({
      password: PASSWORD
    })
    const wallet = new ZilliqaWallet()
    const index = 1

    wallet.addByMnemonic(SEED, index)

    await instance.createAccountBySeed((result) => {
      if (result.reject) {
        return null
      }

      expect(result.resolve).toBeTruthy()

      expect(result.resolve.selectedAddress).toBe(index)

      const wallet = result.resolve
      const account = wallet.identities[wallet.selectedAddress].address

      expect(account.address).toBe(wallet.defaultAccount.address)
    })
  })

  it('try import PrivateKey', async() => {
    const instance = new Wallet({
      privKey: PRIVATE_KEY
    })
    const wallet = new ZilliqaWallet()

    wallet.addByPrivateKey(PRIVATE_KEY)

    await instance.importPrivateKey((result) => {
      if (result.reject) {
        return null
      }

      expect(result.resolve).toBeTruthy()
      expect(result.resolve.selectedAddress).toBe(2)

      const wallet = result.resolve
      const account = wallet.identities[wallet.selectedAddress].address

      expect(account.address).toBe(wallet.defaultAccount.address)
    })
  })
})
