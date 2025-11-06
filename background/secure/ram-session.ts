import { SESSION_ERRORS } from "./errors";

export interface RAMStorageData {
  data: Uint8Array;
  mac: Uint8Array;
  timestamp: number;
}

export class RAMStorage {
  #storage = new Map<string, RAMStorageData>();

  async set(key: string, value: Uint8Array, ttl: number): Promise<void> {
    const mac = await this.#computeMAC(value, key);
    this.#storage.set(key, {
      data: value,
      mac,
      timestamp: Date.now() + ttl,
    });
  }

  async get(key: string): Promise<Uint8Array | null> {
    const entry = this.#storage.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp) {
      this.#storage.delete(key);
      return null;
    }

    const isValid = await this.#verifyMAC(entry.data, entry.mac, key);
    if (!isValid) {
      this.#storage.delete(key);
      throw new Error(SESSION_ERRORS.DATA_INCOMPLETE);
    }

    return entry.data;
  }

  delete(key: string): void {
    this.#storage.delete(key);
  }

  clear(): void {
    this.#storage.clear();
  }

  async #computeMAC(data: Uint8Array, key: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data as BufferSource);
    return new Uint8Array(signature);
  }

  async #verifyMAC(data: Uint8Array, mac: Uint8Array, key: string): Promise<boolean> {
    const computedMAC = await this.#computeMAC(data, key);
    if (computedMAC.length !== mac.length) return false;
    return computedMAC.every((byte, i) => byte === mac[i]);
  }
}

