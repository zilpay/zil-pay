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

        await Runtime.storage.local.set(data);
    },

    async get<T>(...keys: (OldFields | string)[]): Promise<T> { 
        const result = await Runtime.storage.local.get(keys);

        if (keys.length === 1 && result) {
            return result[keys[0]];
        }
        
        return result as T;
    },

    async getAll(): Promise<StorageKeyValue> {
        return Runtime.storage.local.get(null);
    },

    async rm(...keys: (OldFields | string)[]): Promise<void> {
        await Runtime.storage.local.remove(keys);
    },

    async clear(): Promise<void> {
        await Runtime.storage.local.clear();
    },
});
