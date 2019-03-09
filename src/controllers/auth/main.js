import { SecurityGuard } from './guard/main'
import { MnemonicSeed } from './mnemonic'


export class Auth extends SecurityGuard {

  constructor(password) {
    super(password);
    this.isReady = false;
    this.isEnable = false;
    this.mnemonic = new MnemonicSeed();
  }


}