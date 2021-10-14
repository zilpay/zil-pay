/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Info } from 'types/token';
import type { StreamResponse } from 'types/stream';
import { ZIlPayCore } from './core';

export class ZilPayZRC extends ZIlPayCore {
  public async getZRC2Info(address: string, sendResponse: StreamResponse) {
    try {
      const token = await this._zrc2.getToken(address);

      sendResponse({
        resolve: token
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async addZRC2(token: ZRC2Info, sendResponse: StreamResponse) {
    try {
      await this._zrc2.add(token);

      sendResponse({
        resolve: this._zrc2.identities
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeToken(index: number, sendResponse: StreamResponse) {
    try {
      await this._zrc2.remove(index);

      sendResponse({
        resolve: this._zrc2.identities
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
