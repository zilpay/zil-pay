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
import { TypeOf } from 'lib/type/type-checker';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { Common } from 'config/common';

export class AuthGuard {
  // hash of the password.
  private _hash = new WeakMap();
  // this property is responsible for control session.
  private _isEnable = false;
  // this property is responsible for control wallet.
  private _isReady = false;
  // Imported storage in encrypted.
  private _encryptImported?: string;
  // Seed phase storage in encrypted.
  private _encryptSeed?: string;
  // Current time + some hours.
  private _endSession = new Date(-1);

  public get isEnable() {
    const now = new Date().getTime();
    const timeDifference = this._endSession.getTime() - now;

    return timeDifference > 0 && this._isEnable;
  }

  public get isReady() {
    return this.isReady;
  }

  public async sync() {
    const data = await BrowserStorage.get(
      Fields.VAULT,
      Fields.VAULT_IMPORTED
    );

    this._encryptImported = data[Fields.VAULT_IMPORTED];
    this._encryptSeed = data[Fields.VAULT];
    this._isReady = Boolean(this._encryptSeed);
  }

  public setPassword(password: string) {
    if (!this._isReady) {
      throw new Error('is not ready');
    }
    
    const hash = Aes.hash(password);
    Aes.decrypt(this._encryptSeed, hash);

    if (this._encryptImported) {
      Aes.decrypt(this._encryptImported, hash);
    }

    this._updateSession();
    this._isEnable = true;
    this._hash.set(this, hash);
  }

  public getWallet(): GuardVault {
    this._checkSession();

    const hash = this._hash.get(this);
    const decryptSeed = Aes.decrypt(this._encryptSeed, hash);
    const decryptImported = this._encryptImported ?
      JSON.parse(Aes.decrypt(this._encryptImported, hash)) : [];

    return {
      decryptSeed,
      decryptImported
    };
  }

  /**
   * Write decryptImported to storage.
   * @param decryptImported - Imported account object.
   * @return String.
   */
  public async updateImported(decryptImported: object[]) {
    this._checkSession();

    const hash = this._hash.get(this);
    const encryptImported = Aes.encrypt(JSON.stringify(decryptImported), hash);

    await BrowserStorage.set(
      buildObject(Fields.VAULT_IMPORTED, encryptImported)
    );

    this._encryptImported = encryptImported;
  }

  public async updateMnemonic(decryptSeed: string) {
    this._checkSession();

    const hash = this._hash.get(this);
    const encryptSeed = Aes.encrypt(JSON.stringify(decryptSeed), hash);

    await BrowserStorage.set(
      buildObject(Fields.VAULT, encryptSeed)
    );

    this._encryptSeed = encryptSeed;
  }

  private _checkSession() {
    assert(this._isEnable, 'Wallet is not enabled.');
    assert(this._isReady, 'Wallet is not sync.');
  }

  private async _updateSession() {
    const now = new Date().getTime();
    const time = await BrowserStorage.get(Fields.LOCK_TIME);
    const h = TypeOf.isNull(Number(time)) ? Number(time) : Common.TIME_BEFORE_LOCK;
    const newSession = new Date();

    newSession.setTime(now + (h * 60 * 60 * 1000));

    this._endSession = newSession;
  }

}
