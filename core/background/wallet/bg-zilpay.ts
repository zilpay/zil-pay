/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { ZIlPayCore } from './core';
import { ZilPayElliptic} from './elliptic';
import { ZilPayNetwrok } from './netwrok';
import { ZilPayPopup } from './popup';
import { ZilPaySynchronizer } from './synchronizer';
import { ZilPayUnstoppableDomains } from './ud';
import { ZilPayWallet } from './wallet';
import { ZilPayZRC } from './zrc';
import { ZilPayApps } from './apps';
import { ZilPayContacts } from './contacts';

export class ZIlPayBackground {
  private readonly _core = new ZIlPayCore();
  public readonly elliptic = new ZilPayElliptic(this._core);
  public readonly netwrok = new ZilPayNetwrok(this._core);
  public readonly popup = new ZilPayPopup(this._core);
  public readonly synchronizer = new ZilPaySynchronizer(this._core);
  public readonly ud = new ZilPayUnstoppableDomains(this._core);
  public readonly wallet = new ZilPayWallet(this._core);
  public readonly zrc2 = new ZilPayZRC(this._core);
  public readonly apps = new ZilPayApps(this._core);
  public readonly contacts = new ZilPayContacts(this._core);

  public async sync() {
    await this.synchronizer.sync();
  }
}
