import { TypeOf } from 'lib/types';
import { AESCipherV3 } from '../../crypto/aes256';
import { uint8ArrayToBase64, base64ToUint8Array } from '../../crypto/b64';
import { randomBytes } from '../../crypto/random';
import { getManifestVersion, Runtime } from '../../lib/runtime';
import { ManifestVersions } from 'config/manifest';
import { RAMStorage } from './ram-session';
import { SESSION_ERRORS } from './errors';

export enum SessionStorageKeys {
  EndSession = 'SESSION_END',
  SessionKey = 'SESSION_KEY',
  VaultCipher = 'VAULT_CIPHER',
  ActiveWalletIndex = 'ACTIVE_WALLET_INDEX',
}

let ramStorage: RAMStorage | null = null;
let activeWalletIndexRAM = -1;

export class Session {
  #uuid: string;
  #isV2: boolean;

  static async setActiveWallet(walletIndex: number): Promise<void> {
    if (getManifestVersion() === ManifestVersions.V2) {
      activeWalletIndexRAM = walletIndex;
    } else {
      await Runtime.storage.session.set({
        [SessionStorageKeys.ActiveWalletIndex]: walletIndex,
      });
    }
  }

  static async getActiveWallet(): Promise<number> {
    if (getManifestVersion() === ManifestVersions.V2) {
      return TypeOf.isNumber(activeWalletIndexRAM) ? activeWalletIndexRAM : -1;
    }

    const data = await Runtime.storage.session.get(SessionStorageKeys.ActiveWalletIndex);
    const index = data ? Number(data[SessionStorageKeys.ActiveWalletIndex]) : null;

    return TypeOf.isNumber(index) ? Number(index) : -1;
  }

  constructor(uuid: string) {
    this.#isV2 = getManifestVersion() === ManifestVersions.V2;

    if (this.#isV2) {
      ramStorage = ramStorage ?? new RAMStorage();
    } else {
      Runtime.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
    }

    this.#uuid = uuid;
  }

  private getKey(key: SessionStorageKeys): string {
    return `${key}:${this.#uuid}`;
  }

  async setSession(sessionTime: number, vaultContent: Uint8Array): Promise<void> {
    const key = randomBytes(32);
    const vaultCipher = AESCipherV3.encrypt(vaultContent, key);

    if (this.#isV2 && ramStorage) {
      const ttl = sessionTime * 1000;
      await ramStorage.set(this.getKey(SessionStorageKeys.SessionKey), key, ttl);
      await ramStorage.set(this.getKey(SessionStorageKeys.VaultCipher), vaultCipher, ttl);
    } else {
      const endSession = Date.now() + sessionTime * 1000;
      const data = {
        [this.getKey(SessionStorageKeys.EndSession)]: endSession,
        [this.getKey(SessionStorageKeys.SessionKey)]: uint8ArrayToBase64(key),
        [this.getKey(SessionStorageKeys.VaultCipher)]: uint8ArrayToBase64(vaultCipher),
      };
      await Runtime.storage.session.set(data);
    }
  }

  async clearSession(): Promise<void> {
    if (this.#isV2 && ramStorage) {
      ramStorage.clear();
    } else {
      await Runtime.storage.session.clear();
    }
  }

  async getVault(): Promise<Uint8Array> {
    if (this.#isV2 && ramStorage) {
      const sessionKey = await ramStorage.get(this.getKey(SessionStorageKeys.SessionKey));
      const vaultCipher = await ramStorage.get(this.getKey(SessionStorageKeys.VaultCipher));

      if (!sessionKey || !vaultCipher) {
        throw new Error(SESSION_ERRORS.HAS_EXPIRED);
      }

      return AESCipherV3.decrypt(vaultCipher, sessionKey);
    }

    const data = await Runtime.storage.session.get([
      this.getKey(SessionStorageKeys.EndSession),
      this.getKey(SessionStorageKeys.SessionKey),
      this.getKey(SessionStorageKeys.VaultCipher),
    ]);

    const endSession = data[this.getKey(SessionStorageKeys.EndSession)];
    if (!endSession) {
      throw new Error(SESSION_ERRORS.DOES_NOT_EXIST);
    }
    if (Date.now() > endSession) {
      await this.clearSession();
      throw new Error(SESSION_ERRORS.HAS_EXPIRED);
    }

    const sessionKeyBase64 = data[this.getKey(SessionStorageKeys.SessionKey)];
    const vaultCipherBase64 = data[this.getKey(SessionStorageKeys.VaultCipher)];

    if (!sessionKeyBase64 || !vaultCipherBase64) {
      throw new Error(SESSION_ERRORS.DATA_INCOMPLETE);
    }

    const sessionKey = base64ToUint8Array(sessionKeyBase64);
    const vaultCipher = base64ToUint8Array(vaultCipherBase64);

    return AESCipherV3.decrypt(vaultCipher, sessionKey);
  }
}
