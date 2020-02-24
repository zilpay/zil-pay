/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { BuildObject } from 'lib/storage'

import { AccountControl } from './create'
import { ZilliqaControl } from '../blockchain/zilliqa'
import errorsCode from './errors'

export class AccountImporter extends AccountControl {

  constructor(accountControl) {
    super()
    this.auth = accountControl.auth
  }

  initWallet() {
    throw new Error(errorsCode.DisableMethod)
  }

  newAccountBySeed() {
    throw new Error(errorsCode.DisableMethod)
  }

  async importAccountByPrivateKey(privateKey) {
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

    let { decryptImported } = await this.auth.getWallet()

    this.zilliqa = new ZilliqaControl(this.network.provider)

    let wallet = await this._storage.get(FIELDS.WALLET)

    // If found privateKey in Imported Object than replace this account.
    const isFound = decryptImported.find(acc => {
      const somePrivateKey = acc.privateKey.toLocaleLowerCase()
      const forImportPrivateKey = privateKey.toLocaleLowerCase()
      return somePrivateKey === forImportPrivateKey
    })
    const index = isFound ? isFound.index : decryptImported.length

    if (isFound) {
      // If account is found then replace it.
      decryptImported = decryptImported.map(acc => {
        const somePrivateKey = acc.privateKey.toLocaleLowerCase()
        const forImportPrivateKey = privateKey.toLocaleLowerCase()

        if (somePrivateKey === forImportPrivateKey) {
          acc.privateKey = privateKey.toLocaleLowerCase()
        }

        return acc
      })
    } else {
      decryptImported.push({
        index,
        privateKey: privateKey.toLocaleLowerCase()
      })
    }

    // Get the address and publickKey from PrivateKey.
    const account = await this.zilliqa.getAccountByPrivateKey(
      privateKey, index
    )

    for (let index = 0; index < wallet.identities.length; index++) {
      const acc = wallet.identities[index]

      if (acc.address === account.address) {
        throw new Error(errorsCode.ImportUniqueWrong)
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

}

