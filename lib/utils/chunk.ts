/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import assert from 'assert';

export function chunk<T>(arr: T[], size: number): Array<T[]> {
  assert(size > 0, "iIncorrect size.");

  const R = [];
  for (var i=0,len=arr.length; i<len; i+=size)
    R.push(arr.slice(i,i+size));
  return R;
}
