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
import { TabsMessage } from 'lib/streem/tabs-message';
import { MTypeTab } from 'lib/streem/stream-keys';
import { Runtime } from 'lib/runtime';
import { ShaAlgorithms } from 'config/sha-algoritms';
import { ITERACTIONS } from 'config/guard';

interface InitPayload {
  seed: string;
  password: string;
}

export class ZilPayPopup {
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;

    Runtime.alarms.onAlarm.addListener(async (event) => {
      if (event.name.includes(this.#core.blockchain.name)) {
        await this.#core.blockchain.trackBlockNumber();
      }

      if (event.name === this.#core.rate.name) {
        await this.#core.rate.updateRate();
      }
    });
  }

  public updateStatus() {
    if (!this.#core.account.selectedAccount) return null;
    const { base16, bech32 } = this.#core.account.selectedAccount;

    if (this.#core.guard.isEnable && this.#core.guard.isReady) {
      this.#subscribe();
    } else {
      this.#unsubscribe();
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
      resolve: this.#core.state
    });
  }

  public initPopup(sendResponse: StreamResponse) {
    sendResponse({
      resolve: this.#core.state
    });
  }

  public async initSeedWallet(payload: InitPayload, sendResponse: StreamResponse) {
    try {
      this.#core.account.mnemonic.mnemonicToEntropy(payload.seed);
      await this.#core.account.reset();
      await this.#core.guard.setGuardConfig(ShaAlgorithms.Sha512, ITERACTIONS);
      await this.#core.guard.setupVault(
        payload.seed,
        payload.password
      );

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async unlock(password: string, sendResponse: StreamResponse) {
    try {
      if (this.#core.guard.state.iteractions === 0) {
        //  Migrate from old guard.
        const wallet = await this.#core.guard.getFromOldStorage(password);

        await this.#core.guard.setGuardConfig(ShaAlgorithms.Sha512, ITERACTIONS);
        await this.#core.guard.setupVault(
          wallet.mnemonic,
          password
        );
        await this.#core.account.migrate(wallet.keys, wallet.mnemonic);
      }

      await this.#core.guard.unlock(password);
      this.updateStatus();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
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

  #subscribe() {
    this.#core.rate.subscribe();
    this.#core.blockchain.subscribe();
  }

  #unsubscribe() {
    Runtime.alarms.clearAll();
  }
}
