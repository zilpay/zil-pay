/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export interface ZRC2Token {
  decimals: number;
  name: string;
  symbol: string;
  base16: string;
  bech32: string;
  rate: number;
}


export interface InitItem {
  type: string;
  value: string;
  vname: string;
}

export interface ZRC2Info {
  balance: string;
  bech32: string;
  name: string;
  symbol: string;
  decimals: number;
  base16: string;
  rate: number;
}
