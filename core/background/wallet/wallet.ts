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

interface PrivateKeyName {
  name: string;
  privKey: string;
}

export class ZilPayWallet {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public async exportPrivateKey(sendResponse: StreamResponse) {
    try {
      const keyPair = await this._core.account.getKeyPair();
      sendResponse({
        resolve: keyPair
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async exportSeedPhrase(sendResponse: StreamResponse) {
    try {
      const seed = this._core.guard.getSeed();

      sendResponse({
        resolve: seed
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async importPrivateKey(payload: PrivateKeyName, sendResponse: StreamResponse) {
    try {
      const account = await this._core.account.addAccountFromPrivateKey(
        payload.privKey,
        payload.name
      );

      sendResponse({
        resolve: account
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async importKeyStore(sendResponse?: StreamResponse) {}

  public async createAccountBySeed(name: string, sendResponse?: StreamResponse) {
    try {
      const seed = this._core.guard.getSeed();
      const account = await this._core.account.addAccountFromSeed(seed, name);

      await this._core.transactions.sync();

      sendResponse({
        resolve: account
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async selectAccount(index: number, sendResponse: StreamResponse) {
    try {
      const account = await this._core.account.select(index);

      await this._core.transactions.sync();

      sendResponse({
        resolve: account
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async balanceUpdate(sendResponse?: StreamResponse) {
    try {
      const accounts = await this._core.account.balanceUpdate();

      sendResponse({
        resolve: accounts
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
