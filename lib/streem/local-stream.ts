/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import { Runtime } from 'lib/runtime';
import type { ReqBody } from './message';

/**
 * Un-encrypted stream used to communicate between an extensions popup script and background script.
 */
export function localStream(cb: (req: ReqBody, sendResponse: (response?: object) => void) => void) {
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
