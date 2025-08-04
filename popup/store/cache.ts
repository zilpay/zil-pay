import { writable } from 'svelte/store';
import type { IKeyPair } from 'types/wallet';

export interface ICache {
  verifyPhrase?: string[];
  keyPair?: IKeyPair;
}

export const cacheStore = writable<ICache>({});
