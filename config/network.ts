/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export const NETWORK = {
  mainnet: {
    PROVIDER: 'https://api.zilliqa.com',
    MSG_VERSION: 1
  },
  testnet: {
    PROVIDER: 'https://dev-api.zilliqa.com',
    MSG_VERSION: 1
  },
  private: {
    PROVIDER: 'http://127.0.0.1:5555',
    MSG_VERSION: 1
  }
}
export const NETWORK_KEYS = Object.keys(NETWORK);
