/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { ZIlPayCore } from './core';
import { ZilPayNetwrok } from './netwrok';
import { ZilPayPopup } from './popup';
import { ZilPaySynchronizer } from './synchronizer';
import { ZilPayUnstoppableDomains } from './ud';
import { ZilPayWallet } from './wallet';
import { ZilPayZRC } from './zrc';
import { ZilPayApps } from './apps';
import { ZilPayContacts } from './contacts';
import { ZilPayTransaction } from './transaction';
import { ZilPaySettings } from './settings';
import { Runtime } from 'lib/runtime';

export class ZIlPayBackground {
  readonly #core = new ZIlPayCore();
  public readonly netwrok = new ZilPayNetwrok(this.#core);
  public readonly popup = new ZilPayPopup(this.#core);
  public readonly synchronizer = new ZilPaySynchronizer(this.#core);
  public readonly ud = new ZilPayUnstoppableDomains(this.#core);
  public readonly wallet = new ZilPayWallet(this.#core);
  public readonly zrc = new ZilPayZRC(this.#core);
  public readonly apps = new ZilPayApps(this.#core);
  public readonly contacts = new ZilPayContacts(this.#core);
  public readonly transaction = new ZilPayTransaction(this.#core);
  public readonly settings = new ZilPaySettings(this.#core);

  public async sync() {
    Runtime.runtime.onInstalled.addListener(async (event) => {
      await this.synchronizer.sync();
      if (event.reason !== 'update') {
        this.#core.prompt.openTab();
      }
    });

    await this.synchronizer.sync();

    if (this.#core.guard.isReady) {
      Runtime.runtime.onInstalled.removeListener(() => null);
    }
  }
}
