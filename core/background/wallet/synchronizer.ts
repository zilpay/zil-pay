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
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async sync() {
    console.log('start-sync');
    await this.#core.netwrok.sync();
    await this.#core.guard.sync();
    await this.#core.account.sync();
    await this.#core.zrc2.sync();
    await this.#core.blockchain.sync();
    await this.#core.transactions.sync();
    await this.#core.ssn.sync();
    await this.#core.theme.sync();
    await this.#core.locale.sync();
    await this.#core.apps.sync();
    await this.#core.contacts.sync();
    await this.#core.rate.sync();
    await this.#core.addressFormat.sync();
    await this.#core.currencies.sync();
    await this.#core.prompt.sync();
    console.log('end-sync');
  }
}
