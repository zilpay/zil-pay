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

export function fromDecimals(balance: string, decimals: number): Big {
  if (!balance || Number(balance) === 0) {
    return Big(0);
  }

  const _decimals = Big(10**decimals);
  const _balance = Big(balance);

  return _balance.div(_decimals);
}

export function toDecimals(value: string | number, decimals: number): Big {
  if (isNaN(Number(value)) || isNaN(decimals)) {
    return Big(0);
  }

  const _decimals = Big(10).pow(Number(decimals));
  const _amount = Big(value);

  return _amount.mul(_decimals).round();
}
