import { ChaCha20Rng } from '@hicaru/chacharand.js';

export function randomBytes(length: number): Uint8Array {
  const buffer = new Uint8Array(length);
  const randomSeed = new Uint8Array(32);

  window.crypto.getRandomValues(randomSeed);

  const rng = ChaCha20Rng(randomSeed);

  rng.fillBytes(buffer);

  return buffer;
};
