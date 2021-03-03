/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, DEFAULT } from 'config'
import { BuildObject } from 'lib/storage'
import { Account } from '@zilliqa-js/account/dist/account'

import { AccountControl } from './create'
import { ZilliqaControl } from 'packages/background/services/blockchain'
import { ArgumentError, AccessError, ERROR_MSGS } from 'packages/background/errors'

export class AccountImporter extends AccountControl {

  constructor(accountControl) {
    super()
    this.auth = accountControl.auth
  }

  initWallet() {
    throw new AccessError(ERROR_MSGS.DISABLE_DMETHOD)
  }

  newAccountBySeed() {
    throw new AccessError(ERROR_MSGS.DISABLE_DMETHOD)
  }

  async importAccountByPrivateKey(privateKey) {
    await this.auth.vaultSync()

    // Mandatory authentication test.
    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new AccessError(ERROR_MSGS.DISABLED)
    }

    let { decryptImported } = await this.auth.getWallet()

    this.zilliqa = new ZilliqaControl(this.network.provider)

    let wallet = await this._storage.get(FIELDS.WALLET)

    // If found privateKey in Imported Object than replace this account.
    const isFound = decryptImported.find(acc => {
      const somePrivateKey = acc.privateKey.toLowerCase()
      const forImportPrivateKey = privateKey.toLowerCase()
      return somePrivateKey === forImportPrivateKey
    })
    const index = isFound ? isFound.index : decryptImported.length

    if (isFound) {
      // If account is found then replace it.
      decryptImported = decryptImported.map(acc => {
        const somePrivateKey = acc.privateKey.toLowerCase()
        const forImportPrivateKey = privateKey.toLowerCase()

        if (somePrivateKey === forImportPrivateKey) {
          acc.privateKey = privateKey.toLowerCase()
        }

        return acc
      })
    } else {
      decryptImported.push({
        index,
        privateKey: privateKey.toLowerCase()
      })
    }

    // Get the address and publickKey from PrivateKey.
    const account = await this.zilliqa.getAccountByPrivateKey(
      privateKey, index
    )

    for (let index = 0; index < wallet.identities.length; index++) {
      const acc = wallet.identities[index]

      if (acc.address === account.address) {
        throw new ArgumentError('account', ERROR_MSGS.UNIQUE)
      }
    }

    wallet.selectedAddress = wallet.identities.length
    wallet.identities.push({
      index,
      address: account.address,
      balance: account.balance,
      isImport: true
    })

    await this.auth.updateImported(decryptImported)
    await this._storage.set(
      new BuildObject(FIELDS.WALLET, wallet)
    )

    return wallet
  }


  async importAccountByKeyStore(keystore, name, password) {
    await this.auth.vaultSync()

    // Mandatory authentication test.
    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new AccessError(ERROR_MSGS.DISABLED)
    }

    this.zilliqa = new ZilliqaControl(this.network.provider)

    const account = await Account.fromFile(keystore, password)
    let { decryptImported } = await this.auth.getWallet()
    let wallet = await this._storage.get(FIELDS.WALLET)
    const index = decryptImported.length
    const hasAccount = wallet.identities.find(
      (acc) => acc.address.toLowerCase() === account.address.toLowerCase()
    )

    if (hasAccount) {
      throw new ArgumentError('account', ERROR_MSGS.UNIQUE)
    }

    if (!name || name.length > DEFAULT.MAX_LENGTH_NAME) {
      name = `keystore ${index}`
    }

    decryptImported = decryptImported.filter(
      (acc) => account.privateKey.toLowerCase() !== acc.privateKey.toLowerCase()
    )

    decryptImported.push({
      index,
      privateKey: account.privateKey.toLowerCase()
    })

    wallet.selectedAddress = wallet.identities.length
    wallet.identities.push({
      index,
      name,
      address: account.address,
      balance: '0',
      isImport: true
    })

    await this.auth.updateImported(decryptImported)
    await this._storage.set(
      new BuildObject(FIELDS.WALLET, wallet)
    )

    return wallet
  }

}

