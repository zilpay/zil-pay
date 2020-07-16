/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */

/**
 * more [details](https://github.com/MikeMcl/big.js/)
 */
import Big from 'big.js'

export function fromZil(value, decimals, isRound = true) {
  if (isNaN(value) || isNaN(decimals)) {
    return 0
  }

  const _decimals = 10 ** Number(decimals)
  const _amount = Big(value)
  const result = _amount.div(_decimals)

  if (isRound) {
    return String(Math.round(Number(result) * 1000) / 1000)
  } else {
    return result
  }
}

export default fromZil
