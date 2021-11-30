/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
export function uuidv4() {
  const size = 20;

  return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}
