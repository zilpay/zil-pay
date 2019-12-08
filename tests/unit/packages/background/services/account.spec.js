/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import { AccountControl } from 'packages/background/services/account'

import { generateMnemonic } from 'bip39'
import {
  toChecksumAddress,
  verifyPrivateKey
} from '@zilliqa-js/crypto'
import uuidv4 from 'uuid/v4'
import { FIELDS } from 'config'

import { BrowserStorage } from 'lib/storage'

const SEED = generateMnemonic(128)
const password = uuidv4()
const browserStorage = new BrowserStorage()

describe('packages:background:services:AccountControl', () => {
  let accountControl = null
  let currentAccount = null

  it('Should be import AccountControl class', () => {
    expect(AccountControl).toBeTruthy()
  })

  it('Should be able init AccountControl', () => {
    accountControl = new AccountControl()

    expect(accountControl).toBeTruthy()
  })

  it('Should be able init wallet', async() => {
    await accountControl.auth.setPassword(password)

    currentAccount = await accountControl.initWallet(SEED)

    expect(currentAccount.index).toBe(0)
    expect(currentAccount.publicKey).toBeTruthy()
    expect(verifyPrivateKey(currentAccount.privateKey)).toBeTruthy()
    expect(currentAccount.balance).not.toBeNull()
    expect(toChecksumAddress(currentAccount.address)).toBeTruthy()
  })

  it('Should be able create account by seed', async() => {
    const wallet = await accountControl.newAccountBySeed()

    expect(wallet.selectedAddress).toBe(1)
    expect(wallet.identities).toBeTruthy()
    expect(wallet.identities.length).toBe(2)

    const walletFromStorage = await browserStorage.get(FIELDS.WALLET)

    expect(wallet).toEqual(walletFromStorage)
  })

  it('Should be able change wallet', async() => {
    const walletForChange = await browserStorage.get(FIELDS.WALLET)

    walletForChange.selectedAddress = 0

    await accountControl.walletUpdate(walletForChange)

    const walletAfterUpdated = await browserStorage.get(FIELDS.WALLET)

    expect(walletAfterUpdated.selectedAddress).toBe(0)
  })

})
