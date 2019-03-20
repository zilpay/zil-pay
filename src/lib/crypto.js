import crypto from 'crypto'


export default class {

  constructor() {
    this.encryptionAlgorithm = 'aes-256-ctr';
    this.hashAlgorithm = 'sha256';
  }

  hash(string) {
  /**
   * @param {password} string
   * @return hash string.
   */
    return crypto
        .createHash(this.hashAlgorithm)
        .update(string)
        .digest('hex');
  }

  encrypt(data, key) {
    /**
     * @param data: type String.
     * @param key: type String.
     * @returns Encrypted String.
     */
    const encoded = JSON.stringify(data);
    const cipher = crypto.createCipher(this.encryptionAlgorithm, key);

    let crypted = cipher.update(encoded, 'utf8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
  }

  decrypt(data, key) {
    /**
     * @param data: type String.
     * @param key: type String.
     * @returns Decrypted String.
     */
    const decipher = crypto.createDecipher(this.encryptionAlgorithm, key);

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

}
