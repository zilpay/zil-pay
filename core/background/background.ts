/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { localStream, SendResponse } from 'lib/streem/local-stream';
import type { ReqBody } from 'lib/streem/message';

export function startBackground() {
  const _authDispenseMessage = (msg: ReqBody, sendResponse: SendResponse) => {};
  const _popupDispenseMessage = (msg: ReqBody, sendResponse: SendResponse) => {};
  const _contentDispenseMessage = (msg: ReqBody, sendResponse: SendResponse) => {};

  localStream((req, sendResponse) => {
    _authDispenseMessage(req, sendResponse);
    _popupDispenseMessage(req, sendResponse);
    _contentDispenseMessage(req, sendResponse);
  });
}
