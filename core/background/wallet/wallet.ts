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

import qrcode from 'qrcode/lib/browser';

interface PrivateKeyName {
  name: string;
  privKey: string;
}

interface LedgerParams {
  index: number;
  name: string;
  productId: number;
}

export class ZilPayWallet {
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async exportPrivateKey(password: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.setPassword(password);
      const keyPair = await this.#core.account.getKeyPair();
      sendResponse({
        resolve: keyPair
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async exportEncrypted(sendResponse: StreamResponse) {
    try {
      sendResponse({
        resolve: this.#core.guard.encrypted
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async exportAccountQRCode(index: number, sendResponse: StreamResponse) {
    try {
      const account = this.#core.account.wallet.identities[index];
      const base58 = await qrcode.toDataURL(
        `zilliqa://${account.bech32}`,
        {
          width: 200,
          height: 200,
        }
      );
      sendResponse({
        resolve: base58
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async exportSeedPhrase(password: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.setPassword(password);
      const seed = this.#core.guard.getSeed();

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
      await this.#core.account.addAccountFromPrivateKey(
        payload.privKey,
        payload.name
      );
      await this.#core.transactions.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async loadLedgerAccount(payload: LedgerParams, sendResponse: StreamResponse) {
    try {
      await this.#core.ledger.init(payload.productId);
      const { pubAddr, publicKey } = await this.#core.ledger.interface.getPublicAddress(payload.index);
      await this.#core.account.addLedgerAccount(
        publicKey,
        pubAddr,
        payload.index,
        payload.name,
        payload.productId
      );
      await this.#core.transactions.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeAccount(sendResponse: StreamResponse) {
    try {
      const index = this.#core.account.wallet.selectedAddress;
      await this.#core.account.remove(index);
      await this.#core.transactions.sync();

      sendResponse({
        resolve: this.#core.state
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
      const seed = this.#core.guard.getSeed();
      await this.#core.account.addAccountFromSeed(seed, name);
      await this.#core.transactions.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async setAccountName(index: number, name: string, sendResponse: StreamResponse) {
    try {
      await this.#core.account.changeAccountName(index, name);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async selectAccount(index: number, sendResponse: StreamResponse) {
    try {
      await this.#core.account.select(index);
      await this.#core.transactions.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async balanceUpdate(sendResponse: StreamResponse) {
    try {
      await this.#core.account.balanceUpdate();

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
