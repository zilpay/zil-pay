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
import { Validator } from './validator';

export const ZilliqaUtils = {
  BN,
  Long,
  validation: Validator,
  bytes: '',
  units: {}
};
