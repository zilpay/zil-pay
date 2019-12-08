/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT } from 'config'
import { TypeChecker } from 'lib/type'
import { AES } from 'lib/crypto'

import errorsCode from './errors'

export class CryptoGuard {

  constructor(password) {
    // Check on the correctness password.
    if (!new TypeChecker(password).isString) {
      throw new Error(errorsCode.WrongParam)
    } else if (!password || password.length < DEFAULT.MIN_LENGTH_PASSWORD) {
      throw new Error(errorsCode.WrongPassword + DEFAULT.MIN_LENGTH_PASSWORD)
    }
    // Init Crypto utils.
    this._crypto = new AES()
    // Get the SHA256 hash by password.
    this.pwdHash = this._crypto.hash(password)
  }

  /**
   * Encrypted data.
   * @param {String} data: String.
   * @return Encrypted data by password hash.
   */
  encrypt(data) {
    if (!new TypeChecker(data).isString) {
      throw new Error(errorsCode.WrongParam)
    }

    return this._crypto.encrypt(data, this.pwdHash)
  }

  /**
   * Encrypted json Object.
   * @param {Object} object - Object for encrypt.
   * @return Encrypted data by password hash.
   */
  encryptJson(object) {
    if (!new TypeChecker(object).isObject) {
      throw new Error(errorsCode.WrongParam)
    }

    return this._crypto.encrypt(
      JSON.stringify(object), this.pwdHash
    )
  }

  /**
   * Decrypt the encrypted data.
   * @param {String} data - Data for decrypting.
   * @return Some derypted data.
   */
  decrypt(data) {
    if (!new TypeChecker(data).isString) {
      throw new Error(errorsCode.WrongParam)
    }

    return this._crypto.decrypt(data, this.pwdHash)
  }

  /**
   * Decrypt the encrypted data.
   * @param {String} encryptJson - Encryped json object.
   * @return Object.
   */
  decryptJson(encryptJson) {
    if (!new TypeChecker(encryptJson).isString) {
      throw new Error(errorsCode.WrongParam)
    }

    return JSON.parse(
      this._crypto.decrypt(encryptJson, this.pwdHash)
    )
  }

}
