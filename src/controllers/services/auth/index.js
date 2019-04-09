import { CryptoGuard } from '../crypto/guard'
import errorsCode from './errors'
import fields from '../../../config/fields'
import { BrowserStorage, BuildObject } from '../../../lib/storage'


export class Auth {

  constructor(encryptSeed=null, encryptImported=null) {    
    this.isEnable = false;
    this.isReady = false;
    this.encryptImported = encryptImported;
    this.encryptSeed = encryptSeed;
    this._guard = null;

    this._storage = new BrowserStorage();
  }

  async setPassword(password) {
    await this.vaultSync();
    this._guard = new CryptoGuard(password);
    this.isReady = true;

    try {
      const decryptSeed = this._guard.decrypt(this.encryptSeed);
      const decryptImported = this._guard.decryptJson(this.encryptImported);
  
      this.isEnable = true;
      return { decryptSeed, decryptImported };
    } catch(err) {
      this.isEnable = false;
    }

    return null;
  }

  getWallet() {
    if (!this._guard || !this.isReady) {
      throw new Error(errorsCode.GuardWrong);
    } else if (!this.encryptSeed) {
      throw new Error(errorsCode.SyncWrong);
    }

    const decryptSeed = this._guard.decrypt(this.encryptSeed);
    const decryptImported = this._guard.decryptJson(this.encryptImported);
   
    this.isEnable = true;
    this.isReady = true;

    return { decryptSeed, decryptImported };
  }

  async vaultSync() {
    const data = await this._storage.get(
      [fields.VAULT, fields.VAULT_IMPORTED]
    );

    this.encryptSeed = data[fields.VAULT];
    this.encryptImported = data[fields.VAULT_IMPORTED];

    if (this.encryptSeed) {
      this.isReady = true;
    } else {
      this.isReady = false;
    }

    return {
      encryptSeed: this.encryptSeed,
      encryptImported: this.encryptImported
    };
  }

  async updateImported(decryptImported) {
    if (typeof decryptImported !== 'object') {
      throw new Error(errorsCode.WrongImported);
    }
    
    const encryptImported = this._guard.encryptJson(decryptImported);

    await this._storage.set(
      new BuildObject(fields.VAULT_IMPORTED, encryptImported)
    );
    
    return encryptImported;
  }

  static encryptWallet(decryptSeed, decryptImported, password) {
    if (!decryptSeed || typeof decryptSeed !== 'string') {
      throw new Error(errorsCode.WrongSeed);
    } else if (typeof decryptImported !== 'object') {
      throw new Error(errorsCode.WrongImported);
    }
    const guard = new CryptoGuard(password);
    const encryptSeed = guard.encrypt(decryptSeed);
    const encryptImported = guard.encryptJson(decryptImported);
    return { encryptSeed, encryptImported };
  }

}