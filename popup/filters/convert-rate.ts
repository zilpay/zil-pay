/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import Big from 'big.js';

Big.PE = 99;

export function convertRate(rate: number, balance: string | number) {
  if (Number(balance) === 0) {
    return Big(0);
  }

  const _balance = Big(balance);
  const _rate = Big(rate);

  return _balance.mul(_rate);
}
