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
import sha256 from 'crypto-js/sha256'
import Utf8 from 'crypto-js/enc-utf8'

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
