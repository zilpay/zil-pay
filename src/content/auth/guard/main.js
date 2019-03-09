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


// let seed = 'section glue ankle scene unable humor concert fossil music diary kind scrap';
// const securityGuard = new SecurityGuard('123');

// securityGuard.createVault(seed);

// console.log(securityGuard.guard.encryptedSeed);
// console.log(securityGuard.guard.decryptSeed);