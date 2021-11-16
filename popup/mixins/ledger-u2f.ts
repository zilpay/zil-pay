/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
const BRIDGE_URL = 'https://zilpay.github.io/ledger-bridge/';
// const BRIDGE_URL = 'https://127.0.0.1:8080'
const TYPES = {
  init: 'ledger_bridge_ready',
  res: 'ledger_bridge_response',
  fail: 'ledger_bridge_reject',
  req: 'ledger_bridge_request'
};
const INS = [
  'getVersion',
  'getPublickKey',
  'getPublicAddress',
  'signHash',
  'signTxn'
];
