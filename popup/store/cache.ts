import type { IChainConfigState } from 'background/storage';
import type { IKeyPair } from 'types/wallet';
import { writable } from 'svelte/store';

export interface ICache {
  verifyPhrase?: string[];
  keyPair?: IKeyPair;
  chain?: IChainConfigState;
}

export const cacheStore = writable<ICache>({});
