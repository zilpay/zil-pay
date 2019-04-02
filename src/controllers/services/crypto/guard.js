import Crypto from '../../../lib/crypto'
import errorsCode from './errors'


export class CryptoGuard {

  constructor(password) {
    if (typeof password !== 'string') {
      throw new Error(errorsCode.WrongParam);
    } else if (!password || password.length < 6) {
      throw new Error(errorsCode.WrongPassword);
    }

    this._crypto = new Crypto();
    this.pwdHash = this._crypto.hash(password);
  }

  encrypt(data) {
    if (typeof data !== 'string') {
      throw new Error(errorsCode.WrongParam);
    }
    
    return this._crypto.encrypt(data, this.pwdHash);
  }

  encryptJson(object) {
    if (typeof object !== 'object') {
      throw new Error(errorsCode.WrongParam);
    }

    return this._crypto.encrypt(JSON.stringify(object), this.pwdHash);
  }

  decrypt(data) {
    if (typeof data !== 'string') {
      throw new Error(errorsCode.WrongParam);
    }

    return this._crypto.decrypt(data, this.pwdHash);
  }

  decryptJson(encryptJson) {
    if (typeof encryptJson !== 'string') {
      throw new Error(errorsCode.WrongParam);
    }

    return JSON.parse(
      this._crypto.decrypt(encryptJson, this.pwdHash)
    );
  }

}