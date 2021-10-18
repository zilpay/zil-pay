/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export const LI = BigInt(10 ** 6);

export function toLi(value: string | number): string {
  const _value = BigInt(value);
  return String(_value / LI);
}

export function fromLI(value: string | number) {
  const _value = BigInt(value);

  return String(_value * LI);
}
