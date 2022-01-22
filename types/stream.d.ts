/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Params } from './zilliqa';

export interface SendResponseParams {
  resolve?: unknown;
  reject?: unknown;
}
export type StreamResponse = (params: SendResponseParams) => void;

export interface ProxyContentType {
  params: Params;
  method: string;
  uuid: string;
}
