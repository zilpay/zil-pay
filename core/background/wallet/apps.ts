/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { StreamResponse } from 'types/stream';
import type { ZIlPayCore } from './core';
import type { AppConnect } from 'types/app-connect';

export class ZilPayApps {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public async addApp(app: AppConnect, sendResponse: StreamResponse) {
    try {
      await this._core.apps.add(app);

      sendResponse({
        resolve: this._core.apps.connections
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async addConfirm(app: AppConnect, sendResponse: StreamResponse) {
    try {
      await this._core.apps.addConfirm(app);

      /// TODO: open popup.
      sendResponse({
        resolve: app
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public requestConnections(sendResponse: StreamResponse) {
    try {
      sendResponse({
        resolve: this._core.apps.connections
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeApp(index: number, sendResponse: StreamResponse) {
    try {
      await this._core.apps.rm(index);

      sendResponse({
        resolve: this._core.apps.connections
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async clearApps(sendResponse: StreamResponse) {
    try {
      await this._core.apps.reset();

      sendResponse({
        resolve: this._core.apps.connections
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
