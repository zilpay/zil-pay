/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from '../../../../config'
import { AccountControl } from './create'
import { ZilliqaControl } from '../blockchain/zilliqa'
import errorsCode from './errors'

export class AccountExporter extends AccountControl {

  constructor() {
    super()
  }

  initWallet() {
    throw new Error(errorsCode.DisableMethod)
  }

  newAccountBySeed() {
    throw new Error(errorsCode.DisableMethod)
  }

  /**
   * Export Private Key from seed pashe via index.
   */
  async exportPrivateKeyFromSeed() {
    // Sync with storage.
    await this.auth.vaultSync()

    // Mandatory authentication test.
    if (!this.auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this.auth.isReady
      )
    } else if (!this.auth.isEnable) {
      throw new Error(
        errorsCode.WalletIsNotEnable + this.auth.isEnable
      )
    }
    // Get the decrypt seed phase.
    const { decryptSeed } = this.auth.getWallet()

    this.zilliqa = new ZilliqaControl(this.network.provider)

    let wallet = await this._storage.get(FIELDS.WALLET)

    const selectedAccount = wallet.identities[wallet.selectedAddress]

    // Chek account type.
    if (selectedAccount.isImport || selectedAccount.hwType) {
      throw new Error(errorsCode.AccountIsImported)
    }

    const index = selectedAccount.index
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, index
    )

    return {
      index,
      privateKey: account.privateKey
    }
  }

  /**
   * Export private key from imported storage.
   */
  async exportAccountFromStore() {
    // Sync with storage.
    await this.auth.vaultSync()

    // Mandatory authentication test.
    if (!this.auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this.auth.isReady
      )
    } else if (!this.auth.isEnable) {
      throw new Error(
        errorsCode.WalletIsNotEnable + this.auth.isEnable
      )
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
      throw new Error(errorsCode.WrongIndex)
    }

    return account
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

    return !!account.isImport
  }
}
