/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { StreamResponse } from 'types/stream';
import { ZIlPayCore } from './core';
import { MnemonicController } from 'core/background/services/account/mnemonic';
import { toBech32Address } from 'lib/utils/bech32';
import { TabsMessage } from 'lib/streem/tabs-message';
import { MTypeTab } from 'lib/streem/stream-keys';

interface InitPayload {
  seed: string;
  password: string;
}

export class ZilPayPopup extends ZIlPayCore {

  public updateStatus() {
    const { base16, bech32 } = this._account.selectedAccount;

    if (this._guard.isEnable && this._guard.isReady) {
      this._blockchain.subscribe();
      this._rate.subscribe();
    } else {
      this._blockchain.unsubscribe();
      this._rate.unsubscribe();
    }

    new TabsMessage({
      type: MTypeTab.LOCK_STAUS,
      payload: {
        isReady: this._guard.isReady,
        isEnable: this._guard.isEnable,
        account: {
          base16,
          bech32
        }
      }
    }).send();
  }

  public async logout(sendResponse: StreamResponse) {
    await this._guard.logout();
    this.updateStatus();
    sendResponse({
      resolve: {
        isReady: this._guard.isReady,
        isEnable: this._guard.isEnable
      }
    });
  }

  public initPopup(sendResponse: StreamResponse) {
    sendResponse({
      resolve: {
        // TODO: add txns.
        // TODO: add zrc1.
        zrc2: this._zrc2.identities,
        netwrok: this._netwrok.selected,
        wallet: this._account.wallet,
        isReady: this._guard.isReady,
        isEnable: this._guard.isEnable
      }
    });
  }

  public async initSeedWallet(payload: InitPayload, sendResponse: StreamResponse) {
    try {
      await this._guard.setSeed(
        payload.seed,
        payload.password
      );
      const { base16 } = await this._account.fromSeed(payload.seed, 0);
      const bech32 = toBech32Address(base16);

      this.updateStatus();

      sendResponse({
        resolve: {
          bech32,
          base16,
          isReady: this._guard.isReady,
          isEnable: this._guard.isEnable
        }
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public unlock(password: string, sendResponse: StreamResponse) {
    try {
      this._guard.setPassword(password);
      this.updateStatus();

      sendResponse({
        resolve: {
          isReady: this._guard.isReady,
          isEnable: this._guard.isEnable
        }
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public randomizeWords(length: number, sendResponse: StreamResponse) {
    try {
      const mnemonic = new MnemonicController();

      sendResponse({
        resolve: mnemonic.generateMnemonic(length)
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public changeAccountName(name: string, sendResponse: StreamResponse) {
    try {
      const account = this._account.changeAccountName(name);

      sendResponse({
        resolve: account
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
