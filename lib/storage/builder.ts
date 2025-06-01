import type { OldFields } from 'config/fields';
import { TypeOf } from '../types/checker';

export type StorageKeyValue = {
    [key: string]: string;
};

/**
 * Builds a payload object for writing to browser storage.
 * Serializes objects and arrays to JSON strings.
 *
 * @example
 * import { buildObject, BrowserStorage } from 'lib/storage';
 *
 * const storage = Object.freeze(new BrowserStorage()); // Предполагается, что BrowserStorage - Singleton
 * storage.set(buildObject('key', 'any payload'));
 * storage.set(buildObject('objectKey', { a: 1, b: 2 }));
 * storage.set(buildObject('arrayKey', [1, 2, 3]));
 */
export function buildObject(key: OldFields | string, value: string | object | any[]): StorageKeyValue { // Added any[]
    let data: string;

    if (TypeOf.isObject(value) || TypeOf.isArray(value)) {
        try {
            data = JSON.stringify(value);
        } catch (error) {
            // Handle the error appropriately.  For example:
            console.error('Error serializing value to JSON:', error);
            // Consider throwing the error, returning a default value, or logging.
            return { [key]: '' }; // Return empty string,  or throw error.  IMPORTANT
        }
    } else {
        data = String(value);
    }

    return {
        [key]: data,
    };
}

