/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { AccountTypes } from 'config/account-type';

export interface ZRC1Token {
  id: string;
  url: string;
}

export interface Account {
  name: string;
  index: number;
  type: AccountTypes;
  base16: string;
  bech32: string;
  privKey?: string;
  pubKey: string;
  zrc2: {
    [key: string]: string;
  };
  nft: {
    [key: string]: ZRC1Token[];
  };
}

export interface Wallet {
  selectedAddress: number;
  identities: Account[];
}

export interface KeyPair {
  pubKey: string;
  privKey: string;
  base16: string;
};

export interface GuardVault {
  decryptSeed: string,
  decryptImported: {
    index: number;
    privateKey: string;
  }[];
}
