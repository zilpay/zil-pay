/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import {
  AccountControl,
  AccountImporter,
  AccountExporter
} from 'packages/background/services/account'

import { generateMnemonic } from 'bip39'
import {
  toChecksumAddress,
  verifyPrivateKey,
  schnorr
} from '@zilliqa-js/crypto'
import uuidv4 from 'uuid/v4'
import { FIELDS } from 'config'

import { BrowserStorage } from 'lib/storage'

const SEED = generateMnemonic(128)
const PRIVATE_KEY = schnorr.generatePrivateKey()
const password = uuidv4()
const browserStorage = new BrowserStorage()

let accountControl = null
let currentAccount = null
let accountImporter = null
let accountExporter = null

describe('packages:background:services:AccountControl', () => {

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

describe('packages:background:services:AccountImporter', () => {

  it('Should be import AccountImporter class', () => {
    expect(AccountImporter).toBeTruthy()
  })

  it('Should be able init instance', () => {
    accountImporter = new AccountImporter(accountControl)

    expect(accountImporter).toBeTruthy()
  })

  it('Should be able can import by privateKey', async() => {
    const wallet = await accountImporter
      .importAccountByPrivateKey(PRIVATE_KEY)

    expect(wallet.selectedAddress).toBe(2)
    expect(wallet.identities.length).toBe(3)
    expect(wallet.identities[2].index).toBe(0)
    expect(wallet.identities[2].address).toBeTruthy()
    expect(wallet.identities[2].balance).not.toBeNull()
    expect(wallet.identities[2].isImport).toBeTruthy()
  })

})

describe('packages:background:services:AccountExporter', () => {

  it('Should be import AccountImporter class', () => {
    expect(AccountExporter).toBeTruthy()
  })

  it('Should be able init instance', () => {
    accountExporter = new AccountExporter(accountControl)

    expect(accountExporter).toBeTruthy()
  })

  it('Should be able to auth', async() => {
    await accountExporter.auth.setPassword(password)

    expect(accountExporter.auth.isEnable).toBeTruthy()
    expect(accountExporter.auth.isReady).toBeTruthy()
  })

  it('Should be able to exporting account via seed', async() => {
    const wallet = await browserStorage.get(FIELDS.WALLET)

    wallet.selectedAddress = 0

    await accountControl.walletUpdate(wallet)

    const account = await accountExporter.exportPrivateKeyFromSeed()

    expect(account.index).toBe(0)
    expect(account.privateKey).toBeTruthy()
  })

  it('Should be able to exporting account from imported', async() => {
    const wallet = await browserStorage.get(FIELDS.WALLET)

    wallet.selectedAddress = 2

    await accountControl.walletUpdate(wallet)

    const account = await accountExporter.exportAccountFromStore()

    expect(account.index).toBe(0)
    expect(account.privateKey).toEqual(PRIVATE_KEY)
  })

  it('Should be able to exporting seed words', async() => {
    const { decryptSeed, decryptImported } = await accountExporter.exportSeed()

    expect(decryptSeed).toEqual(SEED)
    expect(decryptImported[0].index).toBe(0)
    expect(decryptImported[0].privateKey).toEqual(PRIVATE_KEY)
  })

  it('Should be able to exporting seed words', async() => {
    const isImportAccount = await accountExporter.isImported()

    expect(isImportAccount).toBeTruthy()
  })

})
