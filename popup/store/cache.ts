import { writable } from 'svelte/store';

export interface ICache {
  verifyPhrase?: string[];
}

export const cacheStore = writable<ICache>({});
