/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, DEFAULT } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'

import { CryptoGuard } from '../crypto/guard'
import errorsCode from './errors'

/**
 * Added new method for Date instance.
 * @param {Number} h - Number of hour.
 * @returns: Current date + h hours.
 */
Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000))

  return this
}

export class Auth {

  /**
   * Verification time session.
   * @return Boolean.
   */
  get verificationTime() {
    if (!this._endSession) {
      return null
    }
    const now = new Date()
    const timeDifference = this._endSession - now
    return timeDifference > 0
  }

  constructor(encryptSeed = null, encryptImported = null) {
    // this property is responsible for control session.
    this.isEnable = false
    // this property is responsible for control wallet.
    this.isReady = false
    // Imported storage in encrypted.
    this.encryptImported = encryptImported
    // Seed phase storage in encrypted.
    this.encryptSeed = encryptSeed
    // CryptoGuard instance.
    this._guard = null
    // Current time + some hours.
    this._endSession = null
    // Instance BrowserStorage.
    this._storage = new BrowserStorage()
  }

  /**
   * Activation CryptoGuard by password.
   * @param {String} password - User password string.
   */
  async setPassword(password) {
    // Synchronize with storage
    await this.vaultSync()

    this._guard = new CryptoGuard(password)
    this.isReady = true

    let hours = DEFAULT.TIME_BEFORE_LOCK
    const storage = new BrowserStorage()

    let stateData = await storage.get(FIELDS.STATIC)

    if (stateData) {
      hours = stateData.lockTime
    }

    try {
      const decryptSeed = this._guard.decrypt(this.encryptSeed)
      const decryptImported = this._guard.decryptJson(this.encryptImported)

      this._endSession = new Date().addHours(hours)
      this.isEnable = true

      return { decryptSeed, decryptImported }
    } catch (err) {
      this.isEnable = false
    }

    return null
  }

  /**
   * Get and decrypt the wallet from storage.
   */
  getWallet() {
    if (!this._guard || !this.isReady) {
      throw new Error(errorsCode.GuardWrong)
    } else if (!this.encryptSeed) {
      throw new Error(errorsCode.SyncWrong)
    }

    const decryptSeed = this._guard.decrypt(this.encryptSeed)
    const decryptImported = this._guard.decryptJson(this.encryptImported)

    this.isEnable = true
    this.isReady = true

    return { decryptSeed, decryptImported }
  }

  /**
   * Check access to dApp.
   * @param {String} domain - Website domain name.
   * @return Boolean.
   */
  async isConnect(domain) {
    if (domain && domain.includes('zilpay.xyz')) {
      return true
    }

    const storage = new BrowserStorage()
    let dappList = await storage.get(FIELDS.STATIC)

    try {
      dappList = dappList[FIELDS.STATIC]

      if (new TypeChecker(dappList).isString) {
        dappList = JSON.parse(dappList)
      }

      dappList = dappList['dappsList'] || []

      return dappList.filter(
        dapp => dapp && dapp.domain.includes(domain)
      ).length > 0
    } catch (err) {
      return false
    }
  }

  /**
   * Synchronization with storage.
   */
  async vaultSync() {
    const data = await this._storage.get([
      FIELDS.VAULT,
      FIELDS.VAULT_IMPORTED
    ])

    this.encryptSeed = data[FIELDS.VAULT]
    this.encryptImported = data[FIELDS.VAULT_IMPORTED]

    if (this.encryptSeed) {
      this.isReady = true
    } else {
      this.isReady = false
    }

    return {
      encryptSeed: this.encryptSeed,
      encryptImported: this.encryptImported
    }
  }

  /**
   * Write decryptImported to storage.
   * @param {Object} decryptImported - Imported account object.
   * @return String.
   */
  async updateImported(decryptImported) {
    if (!new TypeChecker(decryptImported).isObject) {
      throw new Error(errorsCode.WrongImported)
    }

    const encryptImported = this._guard.encryptJson(decryptImported)

    await this._storage.set(
      new BuildObject(FIELDS.VAULT_IMPORTED, encryptImported)
    )

    return encryptImported
  }

  /**
   * Encrypt decryptSeed, decryptImported by password.
   */
  static encryptWallet(decryptSeed, decryptImported, password) {
    if (!new TypeChecker(decryptSeed).isString) {
      throw new Error(errorsCode.WrongSeed)
    } else if (!new TypeChecker(decryptImported).isObject) {
      throw new Error(errorsCode.WrongImported)
    }

    const guard = new CryptoGuard(password)
    const encryptSeed = guard.encrypt(decryptSeed)
    const encryptImported = guard.encryptJson(decryptImported)

    return { encryptSeed, encryptImported }
  }

}
