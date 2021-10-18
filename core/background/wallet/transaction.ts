/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { StreamResponse } from 'types/stream';
import type { ZIlPayCore } from './core';
import type { TxParams } from 'types/transaction';
import { Transaction } from 'lib/utils/tx-builder';

export class ZilPayTransaction {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public addConfirm(params: TxParams, sendResponse: StreamResponse) {
    try {
      // const tx = new Transaction();
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
