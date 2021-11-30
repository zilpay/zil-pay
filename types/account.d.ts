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
import type { Themes } from 'config/theme';
import type { Locales } from 'config/locale';

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
  productId?: number;
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

export interface Apps {
  confirmApp?: AppConnect;
  connections: AppConnect[];
}

export interface GuardType {
  isEnable: boolean;
  isReady: boolean;
};

export interface WalletState {
  popup: boolean;
  wallet: Wallet;
  phishing: boolean;
  netwrok: {
    config: typeof NETWORK;
    selected: string;
  };
  format: string;
  lockTime: number;
  locale: string | Locales;
  theme: string | Themes;
  guard: GuardType;
  rate: RateCurrencies,
  apps: Apps;
  currency: string;
  contacts: Contact[];
  gas: {
    gasLimit: number;
    gasPrice: number;
    multiplier: number;
  };
  transactions: {
    forConfirm: TransactionForConfirm[];
    transactions: StoredTx[];
    message: Message;
  };
  zrc2: ZRC2Token[];
  blocknumber: number;
  ssn: {
    selected: number;
    list: SSN[];
  };
}
