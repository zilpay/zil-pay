/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { getPubKeyFromPrivateKey } from '@zilliqa-js/crypto'
import { FIELDS, DEFAULT } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'

import { Auth } from '../auth/index'
import { ZilliqaControl } from '../blockchain/zilliqa'
import { NetworkControl } from '../network/index'
import errorsCodeGuard from '../auth/errors'

import errorsCode from './errors'

const { MAX_LENGTH_NAME, ZERO } = DEFAULT

/**
 * Account controll, managers user accounts.
 * Can create wallet.
 * Can create account(pair pubKey, privKey).
 */
export class AccountControl {

  constructor() {
    this._storage = new BrowserStorage()
    this.network = new NetworkControl()
    this.zilliqa = new ZilliqaControl(this.network.provider)
    this.auth = new Auth()
  }

  resetAuth() {
    this.auth = new Auth()
  }

  /**
   * Initial new wallet by seed phase.
   * @param {String} decryptSeed - Mnemonic seed phrase.
   */
  async initWallet(decryptSeed) {
    this.zilliqa = new ZilliqaControl(this.network.provider)

    if (!this.zilliqa.wallet.isValidMnemonic(decryptSeed)) {
      throw new Error(errorsCodeGuard.WrongDecryptSeed)
    } else if (!this.auth._guard) {
      throw new Error(errorsCodeGuard.GuardWrong)
    }

    const selectedAddress = ZERO
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, selectedAddress
    )
    const encryptedWallet = this.auth._guard.encrypt(decryptSeed)
    const importedWallet = this.auth._guard.encryptJson([])
    const wallet = {
      selectedAddress,
      identities: [{
        address: account.address,
        balance: account.balance,
        index: account.index
      }]
    }

    await this._storage.set([
      new BuildObject(FIELDS.VAULT, encryptedWallet),
      new BuildObject(FIELDS.VAULT_IMPORTED, importedWallet),
      new BuildObject(FIELDS.WALLET, wallet)
    ])

    return account
  }

  /**
   * Create new pair's private Key and public Key via seed phase.
   */
  async newAccountBySeed() {
    await this.auth.vaultSync()

    const { decryptSeed } = this.auth.getWallet()

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

    this.zilliqa = new ZilliqaControl(this.network.provider)

    let wallet = await this._storage.get(FIELDS.WALLET)

    // Get a new index account, but excluding a hardware wallet
    // and importd by private key.
    const index = wallet.identities.filter(
      el => !el.isImport && !el.hwType
    ).length
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, index
    )

    wallet.selectedAddress = wallet.identities.length
    wallet.identities.push({
      address: account.address,
      balance: account.balance,
      index: account.index
    })

    await this._storage.set(
      new BuildObject(FIELDS.WALLET, wallet)
    )

    return wallet
  }

  /**
   * Create and change account name.
   * @param {String} name - User account name.
   */
  async changeAccountName(name) {
    if (!new TypeChecker(name).isString || name.length > MAX_LENGTH_NAME) {
      throw new Error(errorsCode.WrongName)
    }

    let wallet = await this._storage.get(FIELDS.WALLET)

    wallet.identities[wallet.selectedAddress].name = name

    await this.walletUpdate(wallet)
  }

  /**
   * Add to store App info, for confirm access.
   * @param {Object} payload - dapp data.
   * @interface payload: { domain: String, icon: String, title: String }
   */
  async addForConnectDapp(payload) {
    await this._storage.set(
      new BuildObject(FIELDS.CONNECT_DAPP, payload)
    )
  }

  async isConnection(domain) {
    if (domain === 'zilpay.xyz') {
      return true
    }

    const walletData = await this._storage.get(FIELDS.STATIC)

    try {
      const { dappsList } = JSON.parse(walletData)

      if (!dappsList || dappsList.length < 1) {
        return false
      }

      return dappsList.some(
        (app) => app.domain === domain
      )
    } catch (err) {
      return false
    }
  }

  async getCurrentAccount() {
    await this.auth.vaultSync()

    if (!this.auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this.auth.isReady
      )
    } else if (!this.auth.isEnable) {
      throw new Error(
        errorsCode.WalletIsNotEnable + this.auth.isEnable
      )
    }

    let account = {
      privateKey: null,
      publicKey: null,
      address: null,
      index: null
    }
    const wallet = await this._storage.get(FIELDS.WALLET)
    const selectedAccount = wallet.identities[wallet.selectedAddress]
    const { decryptImported, decryptSeed } = this.auth.getWallet()

    account.index = selectedAccount.index
    account.address = selectedAccount.address

    if (selectedAccount.hwType) {
      return {
        ...selectedAccount,
        publicKey: selectedAccount.pubKey
      }
    }

    if (selectedAccount.isImport) {
      const { privateKey } = decryptImported.find(
        acc => acc.index === selectedAccount.index
      )

      account.privateKey = privateKey
    } else if (new TypeChecker(selectedAccount.isImport, selectedAccount.hwType).isUndefined) {
      account = await this.zilliqa.getAccountBySeed(decryptSeed, selectedAccount.index)
    }

    account.publicKey = getPubKeyFromPrivateKey(account.privateKey)

    return account
  }

}
