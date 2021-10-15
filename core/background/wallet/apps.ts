/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZIlPayCore } from './core';

export class ZilPayApps {
  private readonly _core: ZIlPayCore;

  public async signMessage() {}
  public async signTransaction() {}

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public async addApp() {}

  public async removeApp() {}

  public async clearApps() {}
}
