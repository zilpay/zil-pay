import { SecurityGuard } from './guard/main'
import { MnemonicSeed } from './mnemonic'


export class Auth extends SecurityGuard {

  constructor(password, encryptedSeed=null) {
    super(password, encryptedSeed);
    this.isEnable = false;
    this.mnemonic = new MnemonicSeed();

    if (password) {
      this.isReady = true;
    } else {
      this.isReady = false;
    }
  }


}