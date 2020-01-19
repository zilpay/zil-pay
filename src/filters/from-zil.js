/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { units, BN } from '@zilliqa-js/util'

export function fromZil(value, isRound = true) {
  const amount = units.fromQa(new BN(value), units.Units.Zil)
  if (isRound) {
    return Math.round(+amount * 1000) / 1000
  } else {
    return amount
  }
}

export default fromZil
