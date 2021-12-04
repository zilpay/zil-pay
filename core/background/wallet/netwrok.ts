/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZIlPayCore } from './core';
import type { StreamResponse } from 'types/stream';
import { MTypeTab } from 'lib/streem/stream-keys';
import { TabsMessage } from 'lib/streem/tabs-message';
import { NETWORK, NETWORK_KEYS } from 'config/network';

export class ZilPayNetwrok {
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public reactNetwork() {
    new TabsMessage({
      type: MTypeTab.NETWORK_CHANGED,
      payload: {
        netwrok: this.#core.netwrok.selected,
        node: this.#core.netwrok.provider
      }
    }).send();
  }

  public async reset(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.netwrok.reset();
      await this.#core.ssn.select(0);
      await this.#core.transactions.sync();
      await this.#core.zrc2.sync();

      this.reactNetwork();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async select(net: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.netwrok.changeNetwork(net);
      await this.#core.transactions.sync();
      await this.#core.zrc2.sync();

      this.reactNetwork();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async updateSSN(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.ssn.update();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async selectFromSSN(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.ssn.select(index);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async changeConfig(config: typeof NETWORK, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const [,, custom] = NETWORK_KEYS;
      const newConfig = {
        ...this.#core.netwrok.config,
        [custom]: config
      };
      await this.#core.netwrok.changeConfig(newConfig);
      await this.#core.transactions.sync();
      await this.#core.zrc2.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
