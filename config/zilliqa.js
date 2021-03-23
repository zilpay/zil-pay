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
    PROVIDER: 'http://127.0.0.1:5555',
    WS: 'ws://127.0.0.1:5555',
    MSG_VERSION: 1
  }
}

export const ZIL_SWAP_CONTRACTS = {
  [Object.keys(ZILLIQA)[0]]: '0xBa11eB7bCc0a02e947ACF03Cc651Bfaf19C9EC00',
  [Object.keys(ZILLIQA)[1]]: '0x1a62Dd9C84b0C8948cb51FC664ba143e7A34985c'
}
export const SSN_ADDRESS = '0xB780e8095b8BA85A7145965ed632b3B774ac51cE'
export const SCAM_TOKEN = '0xe66593414Ba537e965b5e0eB723a58b4d1fACc89'

/**
 * Default tokens will add to tokens list, this token cannot remove.
 */
export const DEFAULT_TOKENS_LIST = {
  [Object.keys(ZILLIQA)[0]]: [
    '0x173Ca6770Aa56EB00511Dac8e6E13B3D7f16a5a5',
    '0xfbd07e692543d3064B9CF570b27faaBfd7948DA4',
    '0xa845C1034CD077bD8D32be0447239c7E4be6cb21',
    '0x0D21C1901A06aBEE40d8177F95171c8c63AbdC31'
  ],
  [Object.keys(ZILLIQA)[1]]: []
}

export const DEFAULT_GAS_FEE = {
  gasPrice: 2000,
  gasLimit: 1
}

export const DEFAULT_TOKEN = {
  balance: '0',
  decimals: '12',
  name: 'Zilliqa',
  symbol: 'ZIL'
}
