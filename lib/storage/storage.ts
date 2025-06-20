import type { StorageKeyValue } from './builder';
import type { OldFields } from 'config/fields';
import { Runtime } from 'lib/runtime/extensionizer';

type StorageChangesCallback = { [key: string]: chrome.storage.StorageChange; };

export const BrowserStorage = Object.freeze({
    subscribe(callback: (changes: StorageChangesCallback) => void) {
        const listener = (changes: StorageChangesCallback) => {
            try {
                callback(changes);
            } catch (error) {
                console.error("Error in storage change callback:", error);
            }
        };

        Runtime.storage.onChanged.addListener(listener);

        return {
            unsubscribe() {
                Runtime.storage.onChanged.removeListener(listener);
            },
        };
    },

    async set(...items: StorageKeyValue[]): Promise<void> {
        if (items.length === 0) return;

        const data: StorageKeyValue = {};
        for (const item of items) {
            Object.assign(data, item); 
        }

        return new Promise((resolve, reject) => {
            Runtime.storage.local.set(data, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError); 
                } else {
                    resolve();
                }
            });
        });
    },

    async get(...keys: (OldFields | string)[]): Promise<StorageKeyValue> {
        return new Promise((resolve, reject) => {
            Runtime.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                  if (keys.length === 1) {
                    resolve(result[keys[0]]);
                  } else {
                    resolve(result);
                  }
                }
            });
        });
    },

    async getAll(): Promise<StorageKeyValue> {
        return new Promise((resolve, reject) => {
            Runtime.storage.local.get(null, (items) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
            });
        });
    },

    async rm(...keys: (OldFields | string)[]): Promise<void> {
        return new Promise((resolve, reject) => {
            Runtime.storage.local.remove(keys, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    },

    async clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            Runtime.storage.local.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    },
});

