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
export function toLocaleString(value) {
  if (isNaN(value)) {
    return 0
  }

  return Number(value).toLocaleString()
}

export default toLocaleString
