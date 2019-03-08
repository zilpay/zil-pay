import { generateMnemonic, validateMnemonic } from 'bip39'


export class MnemonicSeed {

  getSeed() {
    this.seed = generateMnemonic(128);
    return this.seed;
  }

  validateMnemonic(mnemonic) {
    return validateMnemonic(mnemonic);
  }

}
