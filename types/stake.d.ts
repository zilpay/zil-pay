/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2023 ZilPay
 */

export interface StakeResponse {
  block: number;
  fee: number;
  totalStaked: string;
  totalSupply: string;
  pendingOrders: {
    block: string;
    st: string;
    zil: string;
  }[];
  unbounded: {
    st: string;
    zil: string;
  }[];
}
