/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { generateMnemonic, validateMnemonic } from 'bip39/src/index';
import { randomBytes } from 'lib/crypto/random';

export class MnemonicController {
  public generate(length: number = 128) {
    return generateMnemonic(length, randomBytes);
  }
}
