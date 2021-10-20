/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { APIs, ViewBlockMethods } from 'config/api-list';

export function viewTransaction(hash: string, netwrok: string) {
  const url = APIs.VIEW_BLOCK_URL;
  const type = ViewBlockMethods.Transaction;

  return `${url}/${type}/${hash}?network=${netwrok}`;
}
