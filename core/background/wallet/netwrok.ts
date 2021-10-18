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
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public reactNetwork() {
    new TabsMessage({
      type: MTypeTab.NETWORK_CHANGED,
      payload: {
        netwrok: this._core.netwrok.selected,
        node: this._core.netwrok.provider
      }
    }).send();
  }

  public async select(net: string, sendResponse: StreamResponse) {
    try {
      await this._core.netwrok.changeNetwork(net);
      await this._core.transactions.sync();

      this.reactNetwork();

      sendResponse({
        resolve: this._core.netwrok.selected
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async updateSSN(sendResponse: StreamResponse) {
    try {
      await this._core.ssn.update();

      sendResponse({
        resolve: this._core.ssn.payload
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async changeConfig(config: typeof NETWORK, sendResponse: StreamResponse) {
    try {
      await this._core.netwrok.changeConfig(config);

      sendResponse({
        resolve: this._core.netwrok.config
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
