import { AuthGuard } from './guard'
import { StorageGuard } from './storageGuard'


export class SecurityGuard extends StorageGuard {
  
  constructor(password) {
    super();
    this.guard = new AuthGuard(password, this.EXT_ID);
  }

  async createVault(decryptSeed) {
    this.guard.encryptSeed(decryptSeed);
    await this.setEncryptedSeed(this.guard.encryptedSeed);
    return this.guard.encryptedSeed;
  }

}
