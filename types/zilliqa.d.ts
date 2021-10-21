/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { TxParams } from 'types/transaction';

export type Params = TxParams[] | string[] | number[] | (string | string[] | number[])[];
export type Balance = {
  nonce: number;
  balance: string;
};
