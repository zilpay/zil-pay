/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { SendResponseParams } from 'types/stream';

export function warpMessage(msg: SendResponseParams): any {
  if (!msg) {
    return null;
  }
  if (msg.reject) {
    throw new Error(String(msg.reject));
  }

  return msg.resolve;
}
