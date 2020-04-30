/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import fromZil from './from-zil'

export function toConversion(value, rate) {
  if (isNaN(rate)) {
    return ''
  }

  if (value <= 0) {
    return 0
  }

  let zilAmount = Number(fromZil(value))
  let usdAmount = zilAmount * Number(rate)

  return usdAmount.toFixed(4)
}

export default toConversion
