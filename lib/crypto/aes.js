import crypto from 'crypto'

const DEFAULT_ALGORITHM_ENCRYPT = 'aes-256-ctr'
const DEFAULT_ALGORITHM_HASH = 'sha256'

export class Aes {

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
    return crypto
      .createHash(this.hashAlgorithm)
      .update(string)
      .digest('hex')
  }

  /**
   * Ecnrypt payload through password.
   * @param {Object, Array} data - any payload data.
   * @param {String} key - password.
   * @returns {String} - Encrypted String.
   */
  encrypt(data, key) {
    const encoded = JSON.stringify(data)
    const cipher = crypto.createCipher(this.encryptionAlgorithm, key)

    let crypted = cipher.update(encoded, 'utf8', 'hex')

    crypted += cipher.final('hex')

    return crypted
  }

  /**
   * Decrypt payload through password.
   * @param {String} - Encrypted string.
   * @param {String} key - password.
   * @returns {String} Decrypted Data.
   */
  decrypt(data, key) {
    const decipher = crypto
      .createDecipher(this.encryptionAlgorithm, key)

    let decrypted = decipher.update(data, 'hex', 'utf8')

    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted)
  }

}