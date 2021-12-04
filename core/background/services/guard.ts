/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { GuardVault } from 'types/account';

import assert from 'assert';
import { Aes } from 'lib/crypto/aes';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { Common } from 'config/common';
import { ErrorMessages } from 'config/errors';
import { isPrivateKey } from 'lib/utils/address';

export class AuthGuard {
  // hash of the password.
  #hash = new WeakMap();
  // this property is responsible for control session.
  #isEnable = false;
  // this property is responsible for control wallet.
  #isReady = false;
  // Imported storage in encrypted.
  #encryptImported?: string;
  // Seed phase storage in encrypted.
  #encryptSeed?: string;
  // Current time + some hours.
  #endSession = new Date(-1);
  #time = Common.TIME_BEFORE_LOCK;

  public get lockTime() {
    return Number(this.#time);
  }

  public get isEnable() {
    const now = new Date().getTime();
    const timeDifference = this.#endSession.getTime() - now;

    return timeDifference > 0 && this.#isEnable;
  }

  public get isReady() {
    return this.#isReady;
  }

  public get encrypted() {
    return this.#encryptSeed;
  }

  public async sync() {
    const data = await BrowserStorage.get(
      Fields.VAULT,
      Fields.VAULT_IMPORTED,
      Fields.LOCK_TIME
    );

    this.#encryptImported = data[Fields.VAULT_IMPORTED];
    this.#encryptSeed = data[Fields.VAULT];

    if (data[Fields.LOCK_TIME]) {
      this.#time = Number(data[Fields.LOCK_TIME]);
    } else {
      await BrowserStorage.set(
        buildObject(Fields.LOCK_TIME, String(Common.TIME_BEFORE_LOCK))
      );
    }

    if (this.#encryptSeed) {
      this.#isReady = Boolean(this.#encryptSeed);
    }
  }

  public async setLockTime(h: number) {
    assert(h > 0, ErrorMessages.CannotBeZero);

    this.#time = h;
    await BrowserStorage.set(
      buildObject(Fields.LOCK_TIME, String(this.lockTime))
    );
  }
  
  public async logout() {
    this.#isEnable = false;
    this.#endSession = new Date(-1);

    this.#hash.delete(this);
  }

  public setPassword(password: string) {
    assert(this.isReady, ErrorMessages.WalletNotReady);

    try {
      const hash = Aes.hash(password);
      Aes.decrypt(this.#encryptSeed, hash);
  
      if (this.#encryptImported) {
        Aes.decrypt(this.#encryptImported, hash);
      }
  
      this.#isEnable = true;
      this.#updateSession();
      this.#hash.set(this, hash);
    } catch (err) {
      this.logout();
      throw new Error(ErrorMessages.IncorrectPassword);
    }
  }

  public getWallet(): GuardVault {
    this.checkSession();

    const hash = this.#hash.get(this);
    const decryptSeed = Aes.decrypt(this.#encryptSeed, hash);
    const decryptImported = this.#encryptImported ?
      JSON.parse(Aes.decrypt(this.#encryptImported, hash)) : [];

    return {
      decryptSeed,
      decryptImported
    };
  }

  public getSeed(): string {
    this.checkSession();

    const hash = this.#hash.get(this);

    return Aes.decrypt(this.#encryptSeed, hash);
  }

  public async setSeed(seed: string, password: string) {
    const hash = Aes.hash(password);
    this.#encryptSeed = Aes.encrypt(seed, hash);
    this.#isReady = true;
    this.#isEnable = true;
    this.#updateSession();
    this.#hash.set(this, hash);

    await BrowserStorage.set(
      buildObject(Fields.VAULT, this.#encryptSeed)
    );
  }

  /**
   * Write decryptImported to storage.
   * @param decryptImported - Imported account object.
   * @return String.
   */
  public async updateImported(decryptImported: object[]) {
    this.checkSession();

    const hash = this.#hash.get(this);
    const encryptImported = Aes.encrypt(JSON.stringify(decryptImported), hash);

    await BrowserStorage.set(
      buildObject(Fields.VAULT_IMPORTED, encryptImported)
    );

    this.#encryptImported = encryptImported;
  }

  public encryptPrivateKey(privKey: string) {
    isPrivateKey(privKey);
    const hash = this.#hash.get(this);
    return Aes.encrypt(String(privKey), hash);
  }

  public decryptPrivateKey(content: string) {
    const hash = this.#hash.get(this);

    return Aes.decrypt(content, hash);
  }

  public checkSession() {
    assert(this.#isReady, ErrorMessages.WalletNotReady);
    assert(this.#isEnable, ErrorMessages.WalletNotEnabled);
  }

  async #updateSession() {
    const now = new Date().getTime();
    const h = Number(this.#time);
    const newSession = new Date();

    newSession.setTime(now + (h * 60 * 60 * 1000));

    this.#endSession = newSession;
  }

}
