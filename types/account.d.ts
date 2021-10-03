/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { AccountTypes } from 'config/account-type';

export interface Account {
  name: string;
  index: number;
  type: AccountTypes;
  base16: string;
  bech32: string;
  privKey?: string;
  pubKey: string;
  balance: {
    [key: string]: {
      [key: string]: string;
    };
  };
  [key: string | undefined]: string;
}
