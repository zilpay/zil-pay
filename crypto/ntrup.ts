import { ChaCha20Rng } from "@hicaru/chacharand.js";
import {
  generateKeyPair,
  params761,
  PrivKey,
  PubKey,
  staticBytesEncrypt,
} from "@hicaru/ntrup.js";
import { randomBytes } from "../crypto/random";

export function ntruKeysFromSeed(seedBytes: Uint8Array): {
  pk: PubKey;
  sk: PrivKey;
} {
  const seedPq = seedBytes.slice(0, 32);
  const pqRng = ChaCha20Rng(seedPq);

  return generateKeyPair(pqRng, params761);
}

export function ntruEncrypt(pk: PubKey, plaintext: Uint8Array) {
  let seed = randomBytes(32);
  const rng = ChaCha20Rng(seed);
  // staticBytesEncrypt();
}
