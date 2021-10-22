/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Params } from 'types/zilliqa';

export type RPCBody = {
  id: number;
  jsonrpc: string;
  method: string;
  params: Params;
};

export class HttpProvider {
  readonly #rpc = {
    id: 1,
    jsonrpc: '2.0'
  };

  public json(...rpcBody: RPCBody[]) {
    let body: string;
    if (rpcBody.length === 1) {
      body = JSON.stringify(rpcBody[0]);
    } else {
      body = JSON.stringify(rpcBody);
    }

    return {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  public buildBody(method: string, params: Params) {
    return {
      ...this.#rpc,
      method,
      params
    };
  }
}