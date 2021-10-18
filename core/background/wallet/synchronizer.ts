/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZIlPayCore } from './core';

export class ZilPaySynchronizer {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public async sync() {
    console.log('start-sync');
    await this._core.netwrok.sync();
    await this._core.guard.sync();
    await this._core.account.sync();
    await this._core.zrc2.sync();
    await this._core.blockchain.sync();
    await this._core.transactions.sync();
    await this._core.ssn.sync();
    await this._core.theme.sync();
    await this._core.rate.sync();
    console.log('end-sync');
  }
}
