/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
export enum APIs {
  VIEW_BLOCK_URL = 'https://viewblock.io/zilliqa'
}

export enum ViewBlockMethods {
  Transaction = 'tx',
  Address = 'address',
  Block = 'block'
}

export const MAIN_API = 'https://api.zilpay.io/api/v1';
export const IPFS_PROVIDER = 'https://gateway.pinata.cloud/ipfs/';