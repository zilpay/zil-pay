/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Token } from 'types/token';
import type { MinParams } from 'types/transaction';
import type Big from 'big.js';

import { get } from 'svelte/store';
import { toDecimals } from 'popup/filters/units';

import gasStore from 'popup/store/gas';
import { Contracts } from 'config/contracts';
import { sendToSignTx } from 'app/backend/sign';
import { Runtime } from 'lib/runtime';

export async function buildTx(toAddr: string, amount: Big, token: ZRC2Token) {
  const { gasLimit, gasPrice } = get(gasStore);
  const params: MinParams = {
    toAddr,
    amount: String(amount),
    data: '',
    code: '',
    gasLimit,
    gasPrice,
    icon: Runtime.runtime.getURL('/icons/icon128.png'),
    title: 'ZilPay'
  };
  /// IF ZRC2
  if (token.base16 !== Contracts.ZERO_ADDRESS) {
    params.data = JSON.stringify({
      _tag: 'Transfer',
      params: [
        {
          vname: 'to',
          type: 'ByStr20',
          value: String(toAddr).toLowerCase()
        },
        {
          vname: 'amount',
          type: 'Uint128',
          value: toDecimals(String(amount), token.decimals)
        }
      ]
    });
    params.toAddr = token.base16;
  }
  /// IF ZRC2
  return sendToSignTx(params);
}
