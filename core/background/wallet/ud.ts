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

export class ZilPayUnstoppableDomains {
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async getOwner(domain: string, sendResponse: StreamResponse) {
    try {
      const resolver = await this.#core.ud.getAddressByDomain(domain);

      sendResponse({
        resolve: resolver
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
