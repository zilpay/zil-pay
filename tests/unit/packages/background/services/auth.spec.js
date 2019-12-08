/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import { generateMnemonic } from 'bip39'
import uuidv4 from 'uuid/v4'
import { FIELDS } from 'config'

import { BuildObject, BrowserStorage } from 'lib/storage'
import { Auth } from 'packages/background/services/auth'

const SEED = generateMnemonic(128)
const password = uuidv4()
const browserStorage = new BrowserStorage()

describe('packages:background:services:Auth', () => {
  let authControl = null

  it('Should be import authControl class', () => {
    expect(Auth).toBeTruthy()
  })

  it('Should be able init authControl', () => {
    authControl = new Auth()

    expect(authControl).toBeTruthy()
    expect(authControl.isEnable).toBe(false)
    expect(authControl.isReady).toBe(false)
    expect(authControl.encryptSeed).toBeNull()
    expect(authControl.encryptImported).toBeNull()
  })

  it('create encrypted wallet by password', async() => {
    const wallet = Auth.encryptWallet(
      SEED, [], password
    )

    await browserStorage.set([
      new BuildObject(FIELDS.VAULT, wallet.encryptSeed),
      new BuildObject(FIELDS.VAULT_IMPORTED, wallet.encryptImported)
    ])
  })

  it('Auth control can vault sync', async() => {
    authControl = new Auth()

    await authControl.vaultSync()

    expect(authControl.encryptSeed).not.toBeNull()
    expect(authControl.encryptImported).not.toBeNull()
    expect(authControl.isReady).toBe(true)
    expect(authControl.isEnable).toBe(false)
  })

})
