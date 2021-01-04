/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
const { Promise } = global

export function sleep(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
