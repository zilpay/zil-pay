/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import BN from 'bn.js';
import Big from 'big.js';
import Long from 'long';
import { Validator } from './validator';

Big.PE = 99;

export const Units = {
  Li: Big('1'),
  Qa: Big('1000000'),
  Zil: Big('1000000000000')
};

export function fromQa(
  qa: Big | string | number,
  unit: Big
) {
  const value = Big(qa);
  const res = value.div(unit);

  return String(res);
}

export function toQa(
  qa: Big | number | string,
  unit: Big
) {
  const value = Big(qa);
  const res = value.mul(unit);
  return String(res.round());
}

export const ZilliqaUtils = {
  BN,
  Big,
  Long,
  validation: Validator,
  units: {
    Units,
    fromQa,
    toQa
  }
};
