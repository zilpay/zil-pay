/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Crypto from '../../../../lib/crypto'
import errorsCode from './errors'

export class CryptoGuard {

  constructor(password) {
    // Check on the correctness password.
    if (typeof password !== 'string') {
      throw new Error(errorsCode.WrongParam)
    } else if (!password || password.length < 6) {
      throw new Error(errorsCode.WrongPassword)
    }
    // Init Crypto utils.
    this._crypto = new Crypto()
    // Get the SHA256 hash by password.
    this.pwdHash = this._crypto.hash(password)
  }

  encrypt(data) {
    /**
     * Encrypted data.
     * @interface data: String.
     * @return Encrypted data by password hash.
     */
    if (typeof data !== 'string') {
      throw new Error(errorsCode.WrongParam)
    }

    return this._crypto.encrypt(data, this.pwdHash)
  }

  encryptJson(object) {
    /**
     * Encrypted json Object.
     * @interface object: Object.
     * @return Encrypted data by password hash.
     */
    if (typeof object !== 'object') {
      throw new Error(errorsCode.WrongParam)
    }

    return this._crypto.encrypt(JSON.stringify(object), this.pwdHash)
  }

  decrypt(data) {
    /**
     * Decrypt the encrypted data.
     * @interface data: String.
     * @return Some derypted data.
     */
    if (typeof data !== 'string') {
      throw new Error(errorsCode.WrongParam)
    }

    return this._crypto.decrypt(data, this.pwdHash)
  }

  decryptJson(encryptJson) {
    /**
     * Decrypt the encrypted data.
     * @interface encryptJson: String.
     * @return Object.
     */
    if (typeof encryptJson !== 'string') {
      throw new Error(errorsCode.WrongParam)
    }

    return JSON.parse(
      this._crypto.decrypt(encryptJson, this.pwdHash)
    )
  }

}
