/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Big from 'big.js'
import fromZil from './from-zil'

export function toConversion(value, rate, decimals) {
  if (isNaN(rate) || Number(value) <= 0) {
    return 0
  }

  const _rate = Big(rate)
  let zilAmount = Big(fromZil(value, decimals))
  let coverted = zilAmount.mul(_rate)

  return coverted.round(4)
}

export default toConversion
