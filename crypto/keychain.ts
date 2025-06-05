import { sha256 } from './sha256';

async function deriveKeyFromSeed(seed: Uint8Array, idx: number): Promise<Uint8Array> {
    const hasher = new Uint8Array([...seed, idx]);
    return sha256(hasher);
}

export enum CipherOptions {
  AESGCM256,
  KUZNECHIK,
  NTRUP1277,
}
