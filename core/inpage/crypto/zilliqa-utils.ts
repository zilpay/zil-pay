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

export const Units = {
  Li: BigInt('1'),
  Qa: BigInt('1000000'),
  Zil: BigInt('1000000000000')
};

export function fromQa(
  qa: bigint | string | number,
  unit: bigint
) {
  const value = BigInt(qa);
  const res = value / unit;

  return String(res);
}

export function toQa(
  qa: bigint | number | string,
  unit: bigint
) {
  const value = BigInt(qa);
  const res = value * unit;
  return String(res);
}

export const ZilliqaUtils = {
  BN,
  Long,
  validation: Validator,
  units: {
    Units,
    fromQa,
    toQa
  }
};
