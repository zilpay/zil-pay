/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
export const ZILLIQA = {
  mainnet: {
    PROVIDER: 'https://api.zilliqa.com',
    WS: 'wss://api-ws.zilliqa.com',
    MSG_VERSION: 1
  },
  testnet: {
    PROVIDER: 'https://dev-api.zilliqa.com',
    WS: 'wss://dev-ws.zilliqa.com',
    MSG_VERSION: 1
  },
  private: {
    PROVIDER: 'http://127.0.0.1:4200',
    WS: 'ws://127.0.0.1:4200',
    MSG_VERSION: 1
  }
}


/**
 * Default tokens will add to tokens list, this token cannot remove.
 */
export const DEFAULT_TOKENS_LIST = {
  [Object.keys(ZILLIQA)[0]]: [],
  [Object.keys(ZILLIQA)[1]]: [
    '0x7b949726966b80c93542233531f9bd53542d4514',
    '0x7f4a28aabde4cca04b5529eacb64b1449b317e7f'
  ]
}

export const DEFAULT_GAS_FEE = {
  gasPrice: 1000,
  gasLimit: 1
}

export const DEFAULT_TOKEN = {
  balance: '0',
  decimals: '12',
  name: 'Zilliqa',
  symbol: 'ZIL'
}
