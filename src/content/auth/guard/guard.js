import Crypto from '../../../lib/crypto'

export class AuthGuard extends Crypto {

  get decryptSeed() {
    return this.decrypt(this.encryptedSeed, this.pwdHash);
  }
  
  constructor(password, salt='', encryptedSeed=null) {
    super();
    this.pwdHash = this.hash(password + salt);
    this.encryptedSeed = encryptedSeed;
  }

  encryptSeed(seed) {
    this.encryptedSeed = this.encrypt(seed, this.pwdHash);
    return this.encryptedSeed;
  }

}
