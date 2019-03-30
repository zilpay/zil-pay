import { MnemonicControl } from './mnemonic'
import { AuthGuard } from '../crypto/guard'
import errorsCode from './errors'
import fields from '../../../config/fields'
import { BrowserStorage, BuildObject } from '../../../lib/storage'


export class Auth {

  constructor() {
    this.mnemonicControl = new MnemonicControl();
    
    this.isEnable = false;
    this.isReady = false;
    this.encryptImported = null;
    this.encryptSeed = null;

    this._guard = null;
    this._storage = new BrowserStorage();
  }

  setPassword(password) {
    this._guard = new AuthGuard(password);

    const decryptSeed = this._guard.decrypt(this.encryptSeed);
    const decryptImported = this._guard.decryptJson(this.encryptImported);

    this.isEnable = true;
    this.isReady = true;

    return { decryptSeed, decryptImported };
  }

  getWallet() {
    if (!this._guard || !this.isEnable || !this.isReady) {
      throw new Error(errorsCode.GuardWrong);
    } else if (!this.encryptSeed || !this.encryptImported) {
      throw new Error(errorsCode.SyncWrong);
    }

    const decryptSeed = this._guard.decrypt(this.encryptSeed);
    const decryptImported = this._guard.decryptJson(this.encryptImported);

    return { decryptSeed, decryptImported };
  }

  async vaultSync() {
    const { importedvault, vault } = await this._storage.get(
      [fields.VAULT, fields.VAULT_IMPORTED]
    );

    this.encryptSeed = vault;
    this.encryptImported = importedvault;

    if (this.encryptSeed && this.encryptImported) {
      this.isReady = true;
    } else {
      this.isReady = false;
    }

    return {
      encryptSeed: this.encryptSeed,
      encryptImported: this.encryptImported
    };
  }

}