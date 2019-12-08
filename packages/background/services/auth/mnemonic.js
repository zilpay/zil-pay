/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import {
  generateMnemonic,
  validateMnemonic
} from 'bip39'

export class MnemonicControl {

  get getRandomSeed() {
    this.seed = generateMnemonic(128)
    return this.seed
  }

  validateMnemonic(mnemonic) {
    return validateMnemonic(mnemonic)
  }

}
