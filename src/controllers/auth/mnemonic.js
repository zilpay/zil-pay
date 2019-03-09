import { generateMnemonic, validateMnemonic } from 'bip39'


export class MnemonicSeed {

  get getRandomSeed() {
    this.seed = generateMnemonic(128);
    return this.seed;
  }

  validateMnemonic(mnemonic) {
    return validateMnemonic(mnemonic);
  }

}
