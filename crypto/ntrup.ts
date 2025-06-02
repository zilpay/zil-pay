import { ChaCha20Rng } from "@hicaru/chacharand.js";
import { generateKeyPair, params761, PrivKey, PubKey } from "@hicaru/ntrup.js";

export function ntruKeysFromSeed(seedBytes: Uint8Array): {
  pk: PubKey;
  sk: PrivKey;
} {
  const seedPq = seedBytes.slice(0, 32);
  const pqRng = ChaCha20Rng(seedPq);

  return generateKeyPair(pqRng, params761);
}
