import { AuthGuard } from './guard'
import { StorageGuard } from './storageGuard'


export class SecurityGuard extends StorageGuard {
  
  constructor(password, encryptedSeed=null) {
    super();
    this.guard = new AuthGuard(password, this.EXT_ID, encryptedSeed);
  }

  async createVault(decryptSeed) {
    this.guard.encryptSeed(decryptSeed);
    await this.setEncryptedSeed(this.guard.encryptedSeed);
    return this.guard.encryptedSeed;
  }

  async verificationPassword(password) {
    const vault = await this.getEncryptedSeed();
    this.guard.encryptSeed = vault;
    return this.guard.isDecrypt(vault, password, this.EXT_ID);
  }

}
