/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
export enum APIs {
  COIN_GECKO = 'https://api.coingecko.com/api/v3/simple/price',
  VIEW_BLOCK_URL = 'https://viewblock.io/zilliqa'
}

export enum ViewBlockMethods {
  Transaction = 'tx',
  Address = 'address',
  Block = 'block'
}
