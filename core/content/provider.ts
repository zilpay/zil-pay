/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Params } from 'types/zilliqa';

function json(method: string, params: Params) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      method,
      params,
      id: 1,
      jsonrpc: '2.0'
    })
  };
}

export async function httpProvider(http: string, method: string, params: Params) {
  const request = json(method, params);
  const responce = await fetch(http, request);
  const data = await responce.json();

  return data;
}
