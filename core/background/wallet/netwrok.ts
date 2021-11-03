/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZIlPayCore } from './core';
import type { NETWORK } from 'config/network';
import type { StreamResponse } from 'types/stream';
import { MTypeTab } from 'lib/streem/stream-keys';
import { TabsMessage } from 'lib/streem/tabs-message';

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

  public async select(net: string, sendResponse: StreamResponse) {
    try {
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
      await this.#core.ssn.update();

      sendResponse({
        resolve: this.#core.ssn.payload
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async changeConfig(config: typeof NETWORK, sendResponse: StreamResponse) {
    try {
      await this.#core.netwrok.changeConfig(config);

      sendResponse({
        resolve: this.#core.netwrok.config
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
