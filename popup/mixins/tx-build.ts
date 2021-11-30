/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Token } from 'types/token';
import type { MinParams, StoredTx } from 'types/transaction';
import type Big from 'big.js';

import { get } from 'svelte/store';

import walletStore from 'popup/store/wallet';
import gasStore from 'popup/store/gas';
import themeStore from 'popup/store/theme';

import { Contracts } from 'config/contracts';
import { sendToSignTx } from 'app/backend/sign';
import { Runtime } from 'lib/runtime';
import { viewIcon } from 'lib/block-explorer/view';

export async function repeatTx(tx: StoredTx) {
  const { gasPrice } = get(gasStore);
  const params: MinParams = {
    gasPrice,
    toAddr: tx.toAddr,
    amount: tx.amount,
    data: tx.data || '',
    code: tx.code || '',
    gasLimit: tx.gasLimit,
    icon: tx.icon,
    title: tx.title
  };
  return sendToSignTx(params);
}

export async function cancelTx(tx: StoredTx) {
  const { gasLimit } = get(gasStore);
  const wallet = get(walletStore);
  const acount = wallet.identities[wallet.selectedAddress];
  const params: MinParams = {
    gasLimit,
    toAddr: acount.base16,
    amount: '0',
    data: '',
    code: '',
    gasPrice: Number(tx.gasPrice) * 2,
    icon: tx.icon,
    title: tx.title,
    cancel: true,
    nonce: tx.nonce
  };
  return sendToSignTx(params);
}

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
    const theme = get(themeStore);
    params.icon = viewIcon(token.bech32, theme);
    params.amount = '0';
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
          value: String(amount)
        }
      ]
    });
    params.gasLimit = 1500;
    params.toAddr = token.base16;
  }

  /// IF ZRC2
  return sendToSignTx(params);
}
