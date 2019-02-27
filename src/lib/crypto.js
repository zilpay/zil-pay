import crypto from 'crypto'

export default class {
  encryptionAlgorithm = 'aes-256-ctr';

  encrypt(data, key) {
    const encoded = JSON.stringify(data);
    const cipher = crypto.createCipher(this.encryptionAlgorithm, key);

    let crypted = cipher.update(encoded, 'utf8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
  }

  decrypt(data, key) {
    const decipher = crypto.createDecipher(this.encryptionAlgorithm, key);

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

}
