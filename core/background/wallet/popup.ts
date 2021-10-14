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
import { MnemonicController } from 'core/background/services/account/mnemonic';
import { toBech32Address } from 'lib/utils/bech32';
import { TabsMessage } from 'lib/streem/tabs-message';
import { MTypeTab } from 'lib/streem/stream-keys';

interface InitPayload {
  seed: string;
  password: string;
}

export class ZilPayPopup {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public updateStatus() {
    const { base16, bech32 } = this._core.account.selectedAccount;

    if (this._core.guard.isEnable && this._core.guard.isReady) {
      this._core.blockchain.subscribe();
      this._core.rate.subscribe();
    } else {
      this._core.blockchain.unsubscribe();
      this._core.rate.unsubscribe();
    }

    new TabsMessage({
      type: MTypeTab.LOCK_STAUS,
      payload: {
        isReady: this._core.guard.isReady,
        isEnable: this._core.guard.isEnable,
        account: {
          base16,
          bech32
        }
      }
    }).send();
  }

  public async logout(sendResponse: StreamResponse) {
    await this._core.guard.logout();
    this.updateStatus();
    sendResponse({
      resolve: {
        isReady: this._core.guard.isReady,
        isEnable: this._core.guard.isEnable
      }
    });
  }

  public initPopup(sendResponse: StreamResponse) {
    sendResponse({
      resolve: {
        // TODO: add txns.
        // TODO: add zrc1.
        zrc2: this._core.zrc2.identities,
        netwrok: this._core.netwrok.selected,
        wallet: this._core.account.wallet,
        isReady: this._core.guard.isReady,
        isEnable: this._core.guard.isEnable
      }
    });
  }

  public async initSeedWallet(payload: InitPayload, sendResponse: StreamResponse) {
    try {
      await this._core.guard.setSeed(
        payload.seed,
        payload.password
      );
      const { base16 } = await this._core.account.fromSeed(payload.seed, 0);
      const bech32 = toBech32Address(base16);

      this.updateStatus();

      sendResponse({
        resolve: {
          bech32,
          base16,
          isReady: this._core.guard.isReady,
          isEnable: this._core.guard.isEnable
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
      this._core.guard.setPassword(password);
      this.updateStatus();

      sendResponse({
        resolve: {
          isReady: this._core.guard.isReady,
          isEnable: this._core.guard.isEnable
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
      const account = this._core.account.changeAccountName(name);

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
