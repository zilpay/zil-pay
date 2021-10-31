/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
export function trim(value = '', length = 6) {
  if (!value) {
    return '';
  }

  const part0 = value.slice(0, length);
  const part1 = value.slice(value.length - length);

  return `${part0}...${part1}`;
}
