/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type Big from "big.js";

export function isInsufficientFunds(balance: string | Big = '0', value: string | Big = '0') {
  return BigInt(String(balance)) > BigInt(String(value));
}
