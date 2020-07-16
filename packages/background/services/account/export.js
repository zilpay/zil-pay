/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { AccountControl } from './create'
import { ZilliqaControl } from 'packages/background/services/blockchain'
import { ArgumentError, AccessError, ERROR_MSGS } from 'packages/background/errors'

import { Account } from '@zilliqa-js/account/dist/account'

export class AccountExporter extends AccountControl {

  constructor() {
    super()
  }

  initWallet() {
    throw new AccessError(ERROR_MSGS.DISABLE_DMETHOD)
  }

  newAccountBySeed() {
    throw new AccessError(ERROR_MSGS.DISABLE_DMETHOD)
  }

  /**
   * Export Private Key from seed pashe via index.
   */
  async exportPrivateKeyFromSeed(password) {
    // Sync with storage.
    await this.auth.vaultSync()

    // Mandatory authentication test.
    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new AccessError(ERROR_MSGS.DISABLED)
    }
    // Get the decrypt seed phase.
    const { decryptSeed } = this.auth.getWallet()

    this.zilliqa = new ZilliqaControl(this.network.provider)

    let wallet = await this._storage.get(FIELDS.WALLET)

    const selectedAccount = wallet.identities[wallet.selectedAddress]

    // Chek account type.
    if (selectedAccount.isImport || selectedAccount.hwType) {
      throw new TypeError(`account ${ERROR_MSGS.TYPE_ERR}`)
    }

    const index = selectedAccount.index
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, index
    )
    const accountInstance = new Account(account.privateKey)
    const keystore = await accountInstance.toFile(password)

    return {
      index,
      privateKey: account.privateKey,
      keystore: JSON.stringify(keystore)
    }
  }

  /**
   * Export private key from imported storage.
   */
  async exportAccountFromStore(password) {
    // Sync with storage.
    await this.auth.vaultSync()

    // Mandatory authentication test.
    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new AccessError(ERROR_MSGS.DISABLED)
    }

    const { decryptImported } = await this.auth.getWallet()

    this.zilliqa = new ZilliqaControl(this.network.provider)

    let wallet = await this._storage.get(FIELDS.WALLET)

    const accountID = wallet.identities[wallet.selectedAddress].index
    const account = decryptImported.find(
      // Searching account by index.
      acc => acc.index === accountID
    )

    if (!account) {
      throw new ArgumentError('index')
    }

    const accountInstance = new Account(account.privateKey)
    const keystore = await accountInstance.toFile(password)

    return {
      ...account,
      keystore: JSON.stringify(keystore)
    }
  }

  /**
   * Export seed phase.
   */
  async exportSeed() {
    await this.auth.vaultSync()

    return this.auth.getWallet()
  }

  /**
   * Testing function.
   * @returns Boolean.
   */
  async isImported() {
    let wallet = await this._storage.get(FIELDS.WALLET)

    const account = wallet.identities[wallet.selectedAddress]

    return Boolean(account.isImport)
  }
}
