import { AESCipherV3 } from '../../crypto/aes256';
import { uint8ArrayToBase64, base64ToUint8Array } from '../../crypto/b64';
import { randomBytes } from '../../crypto/random';
import { Runtime } from '../../lib/runtime';

export enum SessionStorageKeys {
  EndSession = 'SESSION_END',
  SessionKey = 'SESSION_KEY',
  VaultCipher = 'VAULT_CIPHER',
}

export class Session {
  #uuid: string;

  constructor(uuid: string) {
    Runtime.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
    this.#uuid = uuid;
  }

  private getKey(key: SessionStorageKeys): string {
    return `${key}:${this.#uuid}`;
  }

  async setSession(sessionTime: number, vaultContent: Uint8Array): Promise<void> {
    const endSession = Date.now() + sessionTime * 1000;
    const key = randomBytes(32);
    const vaultCipher = AESCipherV3.encrypt(vaultContent, key);

    const data = {
      [this.getKey(SessionStorageKeys.EndSession)]: endSession,
      [this.getKey(SessionStorageKeys.SessionKey)]: uint8ArrayToBase64(key),
      [this.getKey(SessionStorageKeys.VaultCipher)]: uint8ArrayToBase64(vaultCipher),
    };
    await Runtime.storage.session.set(data);
  }

  async clearSession(): Promise<void> {
    await Runtime.storage.session.clear();
  }

  async getVault(): Promise<Uint8Array | null> {
    const data = await Runtime.storage.session.get([
      this.getKey(SessionStorageKeys.EndSession),
      this.getKey(SessionStorageKeys.SessionKey),
      this.getKey(SessionStorageKeys.VaultCipher),
    ]);

    const endSession = data[this.getKey(SessionStorageKeys.EndSession)];
    if (!endSession || Date.now() > endSession) {
      await this.clearSession();
      return null;
    }

    const sessionKeyBase64 = data[this.getKey(SessionStorageKeys.SessionKey)];
    const vaultCipherBase64 = data[this.getKey(SessionStorageKeys.VaultCipher)];

    if (!sessionKeyBase64 || !vaultCipherBase64) {
      return null;
    }

    const sessionKey = base64ToUint8Array(sessionKeyBase64);
    const vaultCipher = base64ToUint8Array(vaultCipherBase64);

    return AESCipherV3.decrypt(vaultCipher, sessionKey);
  }
}
