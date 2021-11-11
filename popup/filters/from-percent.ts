/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Token } from 'types/token';
import { get } from 'svelte/store';
import Big from 'big.js';
import zrcStore from 'app/store/zrc';

Big.PE = 99;

export const _100 = Big(100);

export function fromPercent(token: ZRC2Token, balance: string, fee: Big, percent: number) {
  if (Number(balance) === 0) {
    return Big(0);
  }
  const [zilliqa] = get(zrcStore);
  const _amount = token.symbol === zilliqa.symbol ?
      Big(balance).sub(fee) : Big(balance);
  const _percent = Big(percent);
  return _amount.div(_100).mul(_percent).round();
}
