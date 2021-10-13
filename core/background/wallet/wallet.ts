/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { StreamResponse } from 'types/stream';
import { AccountTypes } from 'config/account-type';
import { ZIlPayCore } from './core';
import { ErrorMessages } from 'config/errors';

interface PrivateKeyName {
  name: string;
  privKey: string;
}

export class ZilPayWallet extends ZIlPayCore {

  public async exportPrivateKey(sendResponse: StreamResponse) {
    try {
      switch (this._account.selectedAccount.type) {
        case AccountTypes.Seed:
          const seed = this._guard.getSeed();
          const index = this._account.selectedAccount.index;
          const keyPair = await this._account.fromSeed(seed, index);
          return sendResponse({
            resolve: keyPair
          });
        case AccountTypes.privateKey:
          const encryptedPriveLey = this._account.selectedAccount.privKey;
          const privateKey = this._guard.decryptPrivateKey(encryptedPriveLey);
          return sendResponse({
            resolve: {
              pubKey: this._account.selectedAccount.pubKey,
              privKey: privateKey,
              base16: this._account.selectedAccount.base16
            }
          });
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
      const seed = this._guard.getSeed();

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
      const account = await this._account.addAccountFromPrivateKey(
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
      const seed = this._guard.getSeed();
      const account = await this._account.addAccountFromSeed(seed, name);

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
      const account = this._account.select(index);

      sendResponse({
        resolve: account
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async balanceUpdate(sendResponse?: StreamResponse) {}
}
