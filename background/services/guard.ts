import { utils } from 'aes-js';
import { sha256 } from '../../crypto/sha256';
import { pbkdf2 } from '../../crypto/pbkdf2';
import { Bip39 } from '../../crypto/bip39';
import { Cipher } from '../../crypto/aes256';

import { BrowserStorage, buildObject, StorageKeyValue } from '../../lib/storage';
import { getManifestVersion, Runtime , assert, EXTENSION_ID } from '../../lib/runtime';
import { TypeOf } from '../../lib/types';

import { ShaAlgorithms } from '../../config/sha';
import { Common } from '../../config/common';
import { OldFields } from '../../config/fields';
import { ManifestVersions } from '../../config/manifest';

/**
 * Defines keys used for session storage.
 */
export enum SessionKeys {
  EndSession = "BEARBY_END_SESSION",
  Hash = "BEABRY_HASH",
  PrivateExtendedKey = "EXTENDED_KEY"
}

/**
 * Defines error messages used throughout the AuthGuard class.
 */
export enum ErrorMessages {
  GuardNotSynced = 'Guard is not synced',
  WalletNotReady = 'Wallet is not sync.',
  IncorrectPassword = 'Incorect password',
  WalletNotEnabled = 'Wallet is not enabled.',
  IncorrectConfigParams = 'Incorrect Config params',
  MustBeInt = 'Must be Int.',
  IncorrectParams = 'Incorrect argument',
  InvalidFormat = "Invalid data format encountered during decryption.",
  InvalidKeyLength = "Invalid key length provided. Key must be 16, 24, or 32 bytes.",
}

/**
 * Manages wallet authentication, session, and encryption/decryption of sensitive data.
 */
export class AuthGuard {
  #hash = new WeakMap<AuthGuard, Uint8Array>();
  #oldHash = new WeakMap<AuthGuard, Uint8Array>();
  #algorithm = ShaAlgorithms.sha256;
  #iteractions = 0;

  #isEnable = false;

  #isReady = false;

  #privateExtendedKey?: Uint8Array;
  #encryptMnemonic?: Uint8Array;

  #endSession = new Date(-1);
  #time = Common.TIME_BEFORE_LOCK;

  /**
   * Retrieves the decrypted seed. Requires an active session.
   * @returns The decrypted seed as a Uint8Array.
   */
  get seed() {
    this.checkSession();

    const session = this.#hash.get(this) as Uint8Array;
    const decryptSeedBytes = Cipher.decrypt(
      this.#privateExtendedKey as Uint8Array,
      session
    );

    return Uint8Array.from(decryptSeedBytes);
  }

  /**
   * Gets the configured lock time in hours.
   * @returns The lock time as a number.
   */
  get lockTime() {
    return Number(this.#time);
  }

  /**
   * Checks if the session is currently enabled and active.
   * @returns True if the session is enabled and not expired, false otherwise.
   */
  get isEnable() {
    const now = new Date().getTime();
    const timeDifference = this.#endSession.getTime() - now;

    return timeDifference > 0 && this.#isEnable;
  }

  /**
   * Checks if the wallet is ready (i.e., mnemonic is loaded).
   * @returns True if the wallet is ready, false otherwise.
   */
  get isReady() {
    return this.#isReady;
  }

  /**
   * Provides the current state of the AuthGuard.
   * @returns An object containing the session enable status, wallet readiness, iterations, and algorithm.
   */
  get state() {
    return {
      isEnable: this.isEnable,
      isReady: this.isReady,
      iteractions: this.#iteractions,
      algorithm: this.#algorithm
    };
  }

  /**
   * Gets the encrypted mnemonic.
   * @returns The encrypted mnemonic as a Uint8Array, or undefined if not set.
   */
  get encryptedMnemonic() {
    return this.#encryptMnemonic;
  }

  /**
   * Synchronizes the AuthGuard state with data from browser storage and session storage.
   */
  async sync() {
    const data = await BrowserStorage.get(
      OldFields.VAULT,
      OldFields.LOCK_TIME,
      OldFields.GUARD_CONFIG
    ) as StorageKeyValue;

    if (data && data[OldFields.VAULT]) {
      this.#encryptMnemonic = Buffer.from(data[OldFields.VAULT], 'base64');
      this.#isReady = Boolean(this.#encryptMnemonic);
    }

    if (data && data[OldFields.GUARD_CONFIG]) {
      const [algorithm, iteractions] = String(data[OldFields.GUARD_CONFIG]).split(':');

      if (algorithm === ShaAlgorithms.sha256 || algorithm === ShaAlgorithms.Sha512) {
        this.#algorithm = algorithm;
      }

      if (!isNaN(Number(iteractions))) {
        this.#iteractions = Number(iteractions);
      }
    }

    if (data[OldFields.LOCK_TIME]) {
      this.#time = Number(data[OldFields.LOCK_TIME]);
    } else {
      await BrowserStorage.set(
        buildObject(OldFields.LOCK_TIME, String(Common.TIME_BEFORE_LOCK))
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

  /**
   * Sets the guard configuration, including the hashing algorithm and iterations.
   * @param algorithm The SHA algorithm to use (sha256 or sha512).
   * @param iteractions The number of iterations for key derivation. Must be a non-negative even number.
   */
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
      buildObject(OldFields.GUARD_CONFIG, newConfig)
    );
  }

  /**
   * Sets the logout timer for the session.
   * @param timer The time in hours before the session automatically logs out. Must be a positive integer.
   */
  async setLogOutTimer(timer: number) {
    assert(TypeOf.isInt(timer), ErrorMessages.MustBeInt);
    assert(timer > 0, ErrorMessages.IncorrectParams);

    this.#time = timer;

    await BrowserStorage.set(
      buildObject(OldFields.LOCK_TIME, String(this.lockTime))
    );
  }

  /**
   * Exports the decrypted mnemonic using the provided password.
   * @param password The password to decrypt the mnemonic.
   * @returns The decrypted mnemonic as a UTF-8 string.
   * @throws Error if the wallet is not ready, guard is not synced, or password is incorrect.
   */
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

  /**
   * Retrieves mnemonic and keys from old storage format.
   * @param password The password to decrypt old storage data.
   * @returns An object containing the mnemonic and an array of old guard vault keys.
   */
  async getFromOldStorage(password: string) {
    const data = await BrowserStorage.get(
      OldFields.VAULT,
      OldFields.VAULT_IMPORTED,
    );
    const hash = OldAes.hash(password);
    const encryptedKeys = data[OldFields.VAULT_IMPORTED];
    const mnemonic = OldAes.decrypt(data[OldFields.VAULT], hash);
    let keys: OldGuardVaultKeys[] = [];

    if (encryptedKeys) {
      try {
        keys = JSON.parse(OldAes.decrypt(encryptedKeys, hash));
      } catch {
        // Handle parsing error silently
      }
    }

    return {
      mnemonic,
      keys
    };
  }

  /**
   * Unlocks the wallet using the provided password, decrypting the mnemonic and setting up the session.
   * @param password The password to unlock the wallet.
   * @throws Error if the wallet is not ready, guard is not synced, or password is incorrect.
   */
  async unlock(password: string) {
    assert(this.isReady, ErrorMessages.WalletNotReady);

    try {
      assert(Boolean(this.#encryptMnemonic), ErrorMessages.GuardNotSynced);

      const hash = await this.#getKeyring(password);
      const oldHash = await sha256(utils.utf8.toBytes(password));
      const mnemonicBytes = Cipher.decrypt(this.#encryptMnemonic as Uint8Array, hash);
      const mnemonic = utils.utf8.fromBytes(mnemonicBytes);

      const seed = await Bip39.mnemonicToSeed(mnemonic);

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

  /**
   * Sets up the wallet vault with a new mnemonic and password, encrypting the mnemonic and private extended key.
   * @param mnemonic The mnemonic phrase.
   * @param password The password to encrypt the mnemonic.
   * @param wordList The word list for BIP39.
   * @param passphrase Optional passphrase for BIP39.
   */
  async setupVault(mnemonic: string, password: string, wordList: string[], passphrase?: string ) {
    const mnemonicBuf = utils.utf8.toBytes(mnemonic);
    const hash = await this.#getKeyring(password);
    const seed = await Bip39.mnemonicToSeed(
      mnemonic,
      passphrase,
      wordList,
    );

    this.#encryptMnemonic = Cipher.encrypt(mnemonicBuf, hash);
    this.#privateExtendedKey = Cipher.encrypt(seed, hash);

    this.#isReady = true;
    this.#isEnable = true;
    this.#updateSession();
    this.#hash.set(this, hash);

    await BrowserStorage.set(
      buildObject(OldFields.VAULT, Buffer.from(this.#encryptMnemonic).toString('base64'))
    );
  }

  /**
   * Encrypts a private key using the current session hash.
   * @param privKey The private key as a Uint8Array.
   * @returns The encrypted private key as a base64 string.
   */
  encryptPrivateKey(privKey: Uint8Array) {
    const hash = this.#hash.get(this) as Uint8Array;
    const encrypted = Cipher.encrypt(privKey, hash);

    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Decrypts a private key. Tries to decrypt with old hash first, then with current session hash.
   * @param content The encrypted private key as a base64 string.
   * @returns The decrypted private key as a hex string.
   */
  decryptPrivateKey(content: string): string {
    const hash = this.#hash.get(this) as Uint8Array;
    const oldHash = this.#oldHash.get(this) as Uint8Array;
    let privateKey: string;

    try {
      privateKey = OldAes.decrypt(content, Buffer.from(oldHash).toString('hex'));

    } catch {
      const bytes = Cipher.decrypt(Buffer.from(content, 'base64'), hash);

      privateKey = Buffer.from(bytes).toString('hex');
    }

    return privateKey;
  }

  /**
   * Checks if the session is active and the wallet is ready. Throws an error if not.
   */
  checkSession() {
    assert(this.#isReady, ErrorMessages.WalletNotReady);
    assert(this.#isEnable, ErrorMessages.WalletNotEnabled);
  }

  /**
   * Logs out the current session, disabling it and clearing session-related data.
   */
  async logout() {
    this.#isEnable = false;
    this.#endSession = new Date(-1);

    this.#hash.delete(this);
  }

  /**
   * Updates the session end time based on the configured lock time.
   */
  async #updateSession() {
    const now = new Date().getTime();
    const h = Number(this.#time);
    const newSession = new Date();

    newSession.setTime(now + (h * 60 * 60 * 1000));

    this.#endSession = newSession;
  }

  /**
   * Derives a key from the password using either SHA256 or PBKDF2, based on configuration.
   * @param password The password to derive the key from.
   * @returns The derived key as a Uint8Array.
   */
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

