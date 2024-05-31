/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import BN from 'bn.js';
import Long from 'long';
import { isBech32, isByteString } from 'lib/utils/address/hex';

export const Validator = {
  isAddress(x: unknown) {
    return isByteString(String(x), 40);
  },
  isBech32(x: unknown) {
    return isBech32(String(x));
  },
  isBN(x: unknown) {
    return BN.isBN(x);
  },
  isLong(x: unknown) {
    return Long.isLong(x);
  }
};
