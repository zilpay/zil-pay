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

export function fromDecimals(balance: string, decimals: number) {
  if (Number(balance) === 0) {
    return Big(0);
  }

  const _decimals = Big(10**decimals);
  const _balance = Big(balance);

  return _balance.div(_decimals);
}
