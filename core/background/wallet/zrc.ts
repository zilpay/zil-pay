/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Info, ZRCNFT } from 'types/token';
import type { StreamResponse } from 'types/stream';
import type { ZIlPayCore } from './core';

import { fromBech32Address } from 'lib/utils/bech32';

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
      this.#core.guard.checkSession();
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
      this.#core.guard.checkSession();
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

  public async updateNFTList(sendResponse: StreamResponse) {
    try {
      // await this.#core.nft.updateTokens(); // server
      await this.#core.nft.update();

      sendResponse({
        resolve: this.#core.nft.identities
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async fetchNFT(addresses: string[], sendResponse: StreamResponse) {
    try {
      const base16List = addresses.map((bech32) => fromBech32Address(bech32));
      const list = await this.#core.nft.fetchBatch(base16List);

      sendResponse({
        resolve: list
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public getNFTList(sendResponse: StreamResponse) {
    sendResponse({
      resolve: this.#core.nft.identities
    });
  }

  public async addNFT(payload: ZRCNFT, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.nft.add(payload);

      sendResponse({
        resolve: this.#core.nft.identities
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeNFT(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.nft.remove(index);

      sendResponse({
        resolve: this.#core.nft.identities
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
