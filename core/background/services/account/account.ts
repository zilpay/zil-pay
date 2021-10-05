/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Account } from 'types/account';
import hdkey from 'hdkey';

type Wallet = {
  selectedAddress: number;
  identities: Account[];
}

export class AccountController {

  public add() {}

  public remove() {}

  // public fromSeed(seed) {
  //   const seed = bip39.mnemonicToSeed(phrase);
  //   const hdKey = hdkey.fromMasterSeed(seed);
  //   const childKey = hdKey.derive(`m/44'/313'/0'/0/${index}`);
  //   const privateKey = childKey.privateKey.toString('hex');
  //   return this.addByPrivateKey(privateKey);
  // }

  public fromPrivateKey() {}
}
