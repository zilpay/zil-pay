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
import type { Wallet } from 'types/account';

import { Aes } from 'lib/crypto/aes';
import qrcode from 'qrcode/lib/browser';
import { uuidv4 } from 'lib/crypto/uuid';
import { AccountTypes } from 'config/account-type';

interface PrivateKeyName {
  name: string;
  privKey: string;
}

interface LedgerParams {
  index: number;
  name: string;
  productId: number;
  pubAddr?: string,
  publicKey?: string;
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
      this.#core.guard.checkSession();
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

  public async exportQrcodeWallet(password: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.setPassword(password);
      const seed = this.#core.guard.getSeed();
      const wallet: Wallet = JSON.parse(JSON.stringify(this.#core.account.wallet));
      const keys = wallet.identities.filter(
        (acc) => acc.type === AccountTypes.PrivateKey
      ).map((acc) => {
        const privateKey = this.#core.guard.decryptPrivateKey(acc.privKey);

        return {
          privateKey,
          index: acc.index
        };
      });
      const data = {
        seed,
        keys
      };
      const uuid = uuidv4();
      const encrypted = Aes.getEncrypted(data, password);
      const base58 = await qrcode.toDataURL(
        `${uuid}/${encrypted.iv}`,
        {
          width: 200,
          height: 200,
        }
      );

      wallet.identities = wallet.identities.filter(
        (acc) => acc.type !== AccountTypes.Ledger
      ).map((acc) => ({
        ...acc,
        privKey: undefined
      }));

      sendResponse({
        resolve: {
          base58,
          uuid,
          data: {
            wallet,
            cipher: encrypted.cipher,
            zrc2: this.#core.zrc2.identities
          }
        }
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
      this.#core.guard.checkSession();
      await this.#core.ledger.init(payload.productId);
      const { publicKey, pubAddr } = await this.#core.ledger.interface.getPublicAddress(payload.index);

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
      this.#core.guard.checkSession();
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
      this.#core.guard.checkSession();
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
      this.#core.guard.checkSession();
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
      this.#core.guard.checkSession();
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
