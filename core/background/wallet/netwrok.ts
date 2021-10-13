/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { NETWORK } from 'config/network';
import type { StreamResponse } from 'types/stream';
import { MTypeTab } from 'lib/streem/stream-keys';
import { TabsMessage } from 'lib/streem/tabs-message';
import { ZIlPayCore } from './core';

export class ZilPayNetwrok extends ZIlPayCore {

  public reactNetwork() {
    new TabsMessage({
      type: MTypeTab.NETWORK_CHANGED,
      payload: {
        netwrok: this._netwrok.selected,
        node: this._netwrok.provider
      }
    }).send();
  }

  public async select(net: string, sendResponse: StreamResponse) {
    try {
      await this._netwrok.changeNetwork(net);

      this.reactNetwork();

      sendResponse({
        resolve: this._netwrok.selected
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async updateSSN(sendResponse: StreamResponse) {
    try {
      await this._ssn.update();

      sendResponse({
        resolve: this._ssn.payload
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async changeConfig(config: typeof NETWORK, sendResponse: StreamResponse) {
    try {
      await this._netwrok.changeConfig(config);

      sendResponse({
        resolve: this._netwrok.config
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
