/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZIlPayCore } from './core';

export class ZilPayElliptic {
  private readonly _core: ZIlPayCore;

  public async signMessage() {}

  constructor(core: ZIlPayCore) {
    this._core = core;
  }
}
