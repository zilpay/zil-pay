/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { ZIlPayCore } from './core';

export class ZilPaySynchronizer extends ZIlPayCore {
  public async sync() {
    console.log('start-sync');
    await this._netwrok.sync();
    await this._guard.sync();
    await this._account.sync();
    await this._zrc2.sync();
    await this._blockchain.sync();
    await this._ssn.sync();
    await this._theme.sync();
    await this._rate.sync();
    console.log('end-sync');
  }

  public subscribe() {
    this._blockchain.subscribe();
    this._rate.subscribe();
  }
}
