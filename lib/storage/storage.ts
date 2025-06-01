import type { StorageKeyValue } from './builder';
import type { OldFields } from 'config/fields';
import { Runtime } from 'lib/runtime/extensionizer';

type StorageChangesCallback = { [key: string]: chrome.storage.StorageChange; };

/**
 * Default class for working with browser Storage.
 * @example
 * import { BrowserStorage } from 'lib/storage'
 * BrowserStorage.get('KEY').then(data => { ... });
 */
export const BrowserStorage = Object.freeze({
    /**
     * Subscribes to storage changes.
     * @param callback - The callback function to be called when storage changes.
     * @returns An object with an unsubscribe method.
     */
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

    /**
     * Sets multiple key-value pairs in storage.
     * @param items - An array of key-value objects to be stored.
     * @returns A promise that resolves when all items are set.
     */
    async set(...items: StorageKeyValue[]): Promise<void> {
        if (items.length === 0) return;

        const data: StorageKeyValue = {};
        for (const item of items) {
            Object.assign(data, item); // Merge all items into a single object.  Handles duplicate keys.
        }

        return new Promise((resolve, reject) => {
            Runtime.storage.local.set(data, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError); // Reject on error
                } else {
                    resolve();
                }
            });
        });
    },

    /**
     * Gets values from storage for the given keys.
     * @param keys - An array of keys to retrieve from storage.
     * @returns A promise that resolves with the retrieved data.  If one key is provided, the value is returned.  If multiple, an object is returned.
     */
    async get(...keys: (OldFields | string)[]): Promise<StorageKeyValue | any> { // Use 'any' for more flexibility
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

    /**
     * Gets all items from storage.
     * @returns A promise that resolves with an object containing all stored items.
     */
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

    /**
     * Removes items from storage for the given keys.
     * @param keys - An array of keys to remove from storage.
     * @returns A promise that resolves when the items are removed.
     */
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

    /**
     * Clears all items from storage.
     * @returns A promise that resolves when the storage is cleared.
     */
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

