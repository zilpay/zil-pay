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
import { AccountTypes } from 'config/account-type';
import { ErrorMessages } from 'config/errors';

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
      switch (this._core.account.selectedAccount.type) {
        case AccountTypes.Seed:
          const seed = this._core.guard.getSeed();
          const index = this._core.account.selectedAccount.index;
          const keyPair = await this._core.account.fromSeed(seed, index);
          sendResponse({
            resolve: keyPair
          });
          break;
        case AccountTypes.PrivateKey:
          const encryptedPriveLey = this._core.account.selectedAccount.privKey;
          const privateKey = this._core.guard.decryptPrivateKey(encryptedPriveLey);
          sendResponse({
            resolve: {
              pubKey: this._core.account.selectedAccount.pubKey,
              privKey: privateKey,
              base16: this._core.account.selectedAccount.base16
            }
          });
          break;
        case AccountTypes.Ledger:
          throw new Error(ErrorMessages.CannotExportLedger);
      }
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
      sendResponse({
        resolve: account
      });
      return account;
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async selectAccount(index: number, sendResponse: StreamResponse) {
    try {
      const account = await this._core.account.select(index);

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
