/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import crypto from 'crypto'
import aes from 'crypto-js/aes'
import { lib } from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import Utf8 from 'crypto-js/enc-utf8'
import Base64 from 'crypto-js/enc-base64'
import ENCHex from 'crypto-js/enc-hex'

const DEFAULT_ALGORITHM_ENCRYPT = 'aes-256-ctr'
const DEFAULT_ALGORITHM_HASH = 'sha256'

export class AES {

  constructor() {
    this.encryptionAlgorithm = DEFAULT_ALGORITHM_ENCRYPT
    this.hashAlgorithm = DEFAULT_ALGORITHM_HASH
  }

  /**
   * Create sha256 hash string.
   * @example
   * new Aes().hash('my any string')
   * @param {String} string - Any string for hashing;
   * @return {String} - Sha256 hash string.
   */
  hash(string) {
    return sha256(string).toString()
  }

  /**
   * Ecnrypt payload through password.
   * @param {Object, Array} data - any payload data.
   * @param {String} key - password.
   * @returns {String} - Encrypted String.
   */
  encrypt(data, key) {
    return aes
      .encrypt(JSON.stringify(data), key)
      .toString()
  }

  /**
   * Encrypt data and return the object of AES.
   * @param {Object, Array} data - any payload data.
   * @param {String} key - password.
   * @returns {Object} - Encrypted AES object.
   */
  getEncrypted(data, key) {
    const content = JSON.stringify(data)
    const keyAsHex = ENCHex.parse(key)
    const iv = lib.WordArray.random(128 / 8)
    const encryptData = aes.encrypt(content, keyAsHex, { iv: iv })

    return {
      iv: encryptData.iv.toString(),
      cipher: encryptData.ciphertext.toString(Base64)
    }
  }

  /**
   * Decrypt payload through password.
   * @param {String} - Encrypted string.
   * @param {String} key - password.
   * @returns {String} Decrypted Data.
   */
  decrypt(data, key) {
    try {
      const decrypted = aes.decrypt(data, key)
      const content = decrypted.toString(Utf8)

      return JSON.parse(content)
    } catch (err) {
      const decipher = crypto
        .createDecipher(this.encryptionAlgorithm, key)

      let decrypted = decipher.update(data, 'hex', 'utf8')

      decrypted += decipher.final('utf8')

      return JSON.parse(decrypted)
    }
  }

}
