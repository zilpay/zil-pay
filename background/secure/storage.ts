import { BrowserStorage } from '../../lib/storage';
import { base64ToUint8Array, uint8ArrayToBase64 } from '../../crypto/b64';

export class AuthStorage {
  #vault: Uint8Array;

  sync(data: Record<string, unknown>): void {
    this.#validateAndSetVault(data);
  }


  #validateAndSetVault(data: Record<string, unknown>): void {
    const vaultStr = data['vault'];
    if (typeof vaultStr !== 'string') {
      throw new Error('Invalid vault: must be a string');
    }
    try {
      this.#vault = base64ToUint8Array(vaultStr);
    } catch (err) {
      throw new Error(`Failed to decode vault: ${err.message}`);
    }
  }

  async setVault(vault: Uint8Array): Promise<void> {
    const vaultStr = uint8ArrayToBase64(vault);
    await BrowserStorage.set({ vault: vaultStr });
    this.#vault = vault;
  }

  getVault(): Uint8Array | null {
    return this.#vault;
  }
}
