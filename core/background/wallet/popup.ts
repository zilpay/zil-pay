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
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public updateStatus() {
    if (!this.#core.account.selectedAccount) return null;
    const { base16, bech32 } = this.#core.account.selectedAccount;

    if (this.#core.guard.isEnable && this.#core.guard.isReady) {
      this.#core.blockchain.subscribe();
      this.#core.rate.subscribe();
    } else {
      this.#core.blockchain.unsubscribe();
      this.#core.rate.unsubscribe();
    }

    new TabsMessage({
      type: MTypeTab.LOCK_STAUS,
      payload: {
        isEnable: this.#core.guard.isEnable,
        account: {
          base16,
          bech32
        }
      }
    }).send();
  }

  public async logout(sendResponse: StreamResponse) {
    await this.#core.guard.logout();
    this.updateStatus();
    sendResponse({
      resolve: {
        isReady: this.#core.guard.isReady,
        isEnable: this.#core.guard.isEnable
      }
    });
  }

  public initPopup(sendResponse: StreamResponse) {
    sendResponse({
      resolve: this.#core.state
    });
  }

  public async initSeedWallet(payload: InitPayload, sendResponse: StreamResponse) {
    try {
      await this.#core.guard.setSeed(
        payload.seed,
        payload.password
      );
      const { base16 } = await this.#core.account.fromSeed(payload.seed, 0);
      const bech32 = toBech32Address(base16);

      this.updateStatus();

      sendResponse({
        resolve: {
          bech32,
          base16,
          isReady: this.#core.guard.isReady,
          isEnable: this.#core.guard.isEnable
        }
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async unlock(password: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.setPassword(password);
      // this.updateStatus();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      console.log(err)
      return sendResponse({
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
      const account = this.#core.account.changeAccountName(name);

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
