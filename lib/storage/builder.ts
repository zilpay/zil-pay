import type { OldFields } from 'config/fields';
import { TypeOf } from '../types/checker';

export type StorageKeyValue = Record<string, unknown>;

export function buildObject(key: OldFields | string, value: string | object | any[]): StorageKeyValue { 
    let data: string;

    if (TypeOf.isObject(value) || TypeOf.isArray(value)) {
        try {
            data = JSON.stringify(value);
        } catch (error) {
            console.error('Error serializing value to JSON:', error);
            return { [key]: '' };
        }
    } else {
        data = String(value);
    }

    return {
        [key]: data,
    };
}

