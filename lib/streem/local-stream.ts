/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { ReqBody } from './message';
import { Runtime } from 'lib/runtime';


export type SendResponse = (response?: object) => void;
/**
 * Un-encrypted stream used to communicate between an extensions popup script and background script.
 */
export function localStream(cb: (req: ReqBody, sendResponse: SendResponse) => void) {
  Runtime
    .runtime
    .onMessage
    .addListener((req, sender, sendResponse) => {
      if (sender.id !== Runtime.runtime.id) {
        return null
      }

      cb(req, sendResponse);
    });
}
