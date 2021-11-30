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
import type { ZIlPayCore } from './core';

export class ZilPayZRC {
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async getZRC2Info(bech32: string, sendResponse: StreamResponse) {
    try {
      const token = await this.#core.zrc2.getToken(bech32);

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
      await this.#core.zrc2.add(token);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeToken(index: number, sendResponse: StreamResponse) {
    try {
      await this.#core.zrc2.remove(index);

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
