/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { OldGuardVaultKeys } from 'types/account';

import { utils } from 'aes-js';
import { sha256 } from 'lib/crypto/sha';
import { Buffer } from 'buffer';

import { Cipher } from 'lib/crypto/chiher';
import { MnemonicController } from 'core/background/services/account';
import assert from 'assert';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { Fields } from 'config/fields';
import { Common } from 'config/common';
import { isPrivateKey } from 'lib/utils/address';
import { ShaAlgorithms } from 'config/sha-algoritms';
import { pbkdf2 } from 'lib/crypto/pbkdf2';
import { EXTENSION_ID } from 'lib/runtime/id';
import { TypeOf } from 'lib/type/type-checker';
import { ErrorMessages } from 'config/errors';
import { OldAes } from 'lib/crypto/aes';
import { ManifestVersions } from 'config/manifest-versions';
import { getManifestVersion, Runtime } from 'lib/runtime';

export enum SessionKeys {
  EndSession = "BEARBY_END_SESSION",
  Hash = "BEABRY_HASH",
  PrivateExtendedKey = "EXTENDED_KEY"
}

export class AuthGuard {
  // hash of the password.
  #hash = new WeakMap<AuthGuard, Uint8Array>();
  #oldHash = new WeakMap<AuthGuard, Uint8Array>();
  #algorithm = ShaAlgorithms.sha256;
  #iteractions = 0;

  // this property is responsible for control session.
  #isEnable = false;

  // this property is responsible for control wallet.
  #isReady = false;

  #privateExtendedKey?: Uint8Array;
  // Seed phase storage in encrypted.
  #encryptMnemonic?: Uint8Array;

  // Current time + some hours.
  #endSession = new Date(-1);
  #time = Common.TIME_BEFORE_LOCK;

  get seed() {
    this.checkSession();

    const session = this.#hash.get(this) as Uint8Array;
    const decryptSeedBytes = Cipher.decrypt(
      this.#privateExtendedKey as Uint8Array,
      session
    );

    return Uint8Array.from(decryptSeedBytes);
  }

  get lockTime() {
    return Number(this.#time);
  }

  get isEnable() {
    const now = new Date().getTime();
    const timeDifference = this.#endSession.getTime() - now;

    return timeDifference > 0 && this.#isEnable;
  }

  get isReady() {
    return this.#isReady;
  }

  get state() {
    return {
      isEnable: this.isEnable,
      isReady: this.isReady,
      iteractions: this.#iteractions,
      algorithm: this.#algorithm
    };
  }

  get encryptedMnemonic() {
    return this.#encryptMnemonic;
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.VAULT,
      Fields.LOCK_TIME,
      Fields.GUARD_CONFIG
    ) as StorageKeyValue;

    if (data && data[Fields.VAULT]) {
      this.#encryptMnemonic = Buffer.from(data[Fields.VAULT], 'base64');
      this.#isReady = Boolean(this.#encryptMnemonic);
    }

    if (data && data[Fields.GUARD_CONFIG]) {
      const [algorithm, iteractions] = String(data[Fields.GUARD_CONFIG]).split(':');

      if (algorithm === ShaAlgorithms.sha256 || algorithm === ShaAlgorithms.Sha512) {
        this.#algorithm = algorithm;
      }

      if (!isNaN(Number(iteractions))) {
        this.#iteractions = Number(iteractions);
      }
    }

    if (data[Fields.LOCK_TIME]) {
      this.#time = Number(data[Fields.LOCK_TIME]);
    } else {
      await BrowserStorage.set(
        buildObject(Fields.LOCK_TIME, String(Common.TIME_BEFORE_LOCK))
      );
    }

    if (ManifestVersions.V3 === getManifestVersion()) {
      const data = await Runtime.storage.session.get([
        SessionKeys.EndSession,
        SessionKeys.Hash,
        SessionKeys.PrivateExtendedKey
      ]);

      try {
        if (data[SessionKeys.EndSession]) {
          this.#endSession = new Date(data[SessionKeys.EndSession]);
        }
        if (data[SessionKeys.Hash]) {
          const hash = utils.hex.toBytes(data[SessionKeys.Hash]);
          this.#hash.set(this, hash);
          this.#isEnable = true;
        }
        if (data[SessionKeys.PrivateExtendedKey]) {
          this.#privateExtendedKey = utils.hex.toBytes(data[SessionKeys.PrivateExtendedKey]);
        }
      } catch (err) {
        console.warn('guard.sync', err);
      }
    }
  }

  async setGuardConfig(algorithm: string, iteractions: number) {
    assert(
      algorithm === ShaAlgorithms.sha256 || algorithm === ShaAlgorithms.Sha512,
      ErrorMessages.IncorrectConfigParams
    );
    assert(iteractions >= 0, ErrorMessages.IncorrectConfigParams);
    assert(iteractions % 2 === 0, ErrorMessages.IncorrectConfigParams);

    this.#algorithm = algorithm as ShaAlgorithms;
    this.#iteractions = iteractions;

    const newConfig = `${algorithm}:${iteractions}`;

    await BrowserStorage.set(
      buildObject(Fields.GUARD_CONFIG, newConfig)
    );
  }

  async setLogOutTimer(timer: number) {
    assert(TypeOf.isInt(timer), ErrorMessages.MustBeInt);
    assert(timer > 0, ErrorMessages.IncorrectParams);

    this.#time = timer;

    await BrowserStorage.set(
      buildObject(Fields.LOCK_TIME, String(this.lockTime))
    );
  }

  async exportMnemonic(password: string) {
    assert(this.isReady, ErrorMessages.WalletNotReady);

    try {
      assert(Boolean(this.#encryptMnemonic), ErrorMessages.GuardNotSynced);

      const hash = await this.#getKeyring(password);
      const mnemonicBytes = Cipher.decrypt(this.#encryptMnemonic as Uint8Array, hash);

      return utils.utf8.fromBytes(mnemonicBytes);
    } catch (err) {
      this.logout();
      throw new Error(ErrorMessages.IncorrectPassword);
    }
  }

  async getFromOldStorage(password: string) {
    const data = await BrowserStorage.get(
      Fields.VAULT,
      Fields.VAULT_IMPORTED,
    );
    const hash = OldAes.hash(password);
    const encryptedKeys = data[Fields.VAULT_IMPORTED];
    const mnemonic = OldAes.decrypt(data[Fields.VAULT], hash);
    let keys: OldGuardVaultKeys[] = [];

    if (encryptedKeys) {
      try {
        keys = JSON.parse(OldAes.decrypt(encryptedKeys, hash));
      } catch {
        ///
      }
    }

    return {
      mnemonic,
      keys
    };
  }

  async unlock(password: string) {
    assert(this.isReady, ErrorMessages.WalletNotReady);

    try {
      assert(Boolean(this.#encryptMnemonic), ErrorMessages.GuardNotSynced);

      const mnemonicController = new MnemonicController();
      const hash = await this.#getKeyring(password);
      const oldHash = await sha256(utils.utf8.toBytes(password));
      const mnemonicBytes = Cipher.decrypt(this.#encryptMnemonic as Uint8Array, hash);
      const mnemonic = utils.utf8.fromBytes(mnemonicBytes);

      assert(mnemonicController.validateMnemonic(mnemonic), ErrorMessages.IncorrectPassword);

      const seed = await mnemonicController.mnemonicToSeed(mnemonic);

      this.#privateExtendedKey = Cipher.encrypt(seed, hash);

      this.#isEnable = true;
      this.#updateSession();
      this.#hash.set(this, hash);
      this.#oldHash.set(this, oldHash);

      if (ManifestVersions.V3 === getManifestVersion()) {
        Runtime.storage.session.set({
          [SessionKeys.EndSession]: Number(this.#endSession),
          [SessionKeys.Hash]: utils.hex.fromBytes(hash),
          [SessionKeys.PrivateExtendedKey]: utils.hex.fromBytes(this.#privateExtendedKey),
        });
      }
    } catch (err) {
      this.logout();
      throw new Error(`${ErrorMessages.IncorrectPassword}, ${err.message}`);
    }
  }

  async setupVault(mnemonic: string, password: string, usePassword = false) {
    const mnemonicBuf = utils.utf8.toBytes(mnemonic);
    const hash = await this.#getKeyring(password);
    const seed = await new MnemonicController().mnemonicToSeed(
      mnemonic,
      usePassword ? password : undefined
    );

    this.#encryptMnemonic = Cipher.encrypt(mnemonicBuf, hash);
    this.#privateExtendedKey = Cipher.encrypt(seed, hash);

    this.#isReady = true;
    this.#isEnable = true;
    this.#updateSession();
    this.#hash.set(this, hash);

    await BrowserStorage.set(
      buildObject(Fields.VAULT, Buffer.from(this.#encryptMnemonic).toString('base64'))
    );
  }

  encryptPrivateKey(privKey: Uint8Array) {
    isPrivateKey(Buffer.from(privKey).toString('hex'));

    const hash = this.#hash.get(this) as Uint8Array;
    const encrypted = Cipher.encrypt(privKey, hash);

    return Buffer.from(encrypted).toString('base64');
  }

  decryptPrivateKey(content: string): string {
    const hash = this.#hash.get(this) as Uint8Array;
    const oldHash = this.#oldHash.get(this) as Uint8Array;
    let privateKey: string;

    try {
      privateKey = OldAes.decrypt(content, Buffer.from(oldHash).toString('hex'));

      isPrivateKey(privateKey);
    } catch {
      const bytes = Cipher.decrypt(Buffer.from(content, 'base64'), hash);

      privateKey = Buffer.from(bytes).toString('hex');
    }

    isPrivateKey(privateKey);

    return privateKey;
  }

  checkSession() {
    assert(this.#isReady, ErrorMessages.WalletNotReady);
    assert(this.#isEnable, ErrorMessages.WalletNotEnabled);
  }

  async logout() {
    this.#isEnable = false;
    this.#endSession = new Date(-1);

    this.#hash.delete(this);
  }

  async #updateSession() {
    const now = new Date().getTime();
    const h = Number(this.#time);
    const newSession = new Date();

    newSession.setTime(now + (h * 60 * 60 * 1000));

    this.#endSession = newSession;
  }

  async #getKeyring(password: string) {
    const salt = utils.utf8.toBytes(EXTENSION_ID);
    const passwordBytes = utils.utf8.toBytes(password);

    if (this.#algorithm === ShaAlgorithms.sha256 && this.#iteractions === 0) {
      return await sha256(passwordBytes);
    }

    const key = await pbkdf2(passwordBytes, salt, this.#iteractions, this.#algorithm);

    return await sha256(key);
  }
}
