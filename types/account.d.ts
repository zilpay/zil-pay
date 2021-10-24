/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Token } from 'types/token';
import type { SSN } from 'types/ssn';
import type { Contact } from 'types/contact';
import type { AppConnect } from 'types/app-connect';
import type { RateCurrencies } from 'types/zilliqa';
import type { NETWORK } from 'config/network';
import type { MinParams, StoredTx } from 'types/transaction';
import type { AccountTypes } from 'config/account-type';

export interface ZRC1Token {
  id: string;
  url: string;
}
export interface InpageWallet {
  base16: string;
  bech32: string;
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

export interface GuardType {
  isEnable: boolean;
  isReady: boolean;
};

export interface WalletState {
  wallet: Wallet;
  netwrok: {
    config: typeof NETWORK;
    selected: string;
  };
  theme: number;
  guard: GuardType;
  rate: RateCurrencies,
  apps: {
    confirmApp: AppConnect;
    connections: AppConnect[];
  };
  currency: string;
  contacts: Contact[];
  gas: {
    gasLimit: number;
    gasPrice: number;
  };
  transactions: {
    forConfirm: MinParams[];
    transactions: StoredTx[];
  };
  zrc2: ZRC2Token[];
  blocknumber: number;
  ssn: {
    selected: number;
    list: SSN[];
  };
}
