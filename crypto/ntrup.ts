import type { ParamsConfig } from "@hicaru/ntrup.js";
import { ChaCha20Rng, ChaChaRng } from "@hicaru/chacharand.js";
import {
  bytesRqDecode,
  ErrorType,
  generateKeyPair,
  packBytes,
  params761,
  PrivKey,
  PubKey,
  R3,
  r3DecodeChunks,
  r3EncodeChunks,
  r3Encrypt,
  r3MergeWChunks,
  r3SplitWChunks,
  Rq,
  rqDecrypt,
  unpackBytes,
} from "@hicaru/ntrup.js";

import { randomBytes } from "../crypto/random";

export const NTRU_CONFIG = params761;

function bytesEncrypt(
  rng: ChaChaRng,
  plaintext: Uint8Array,
  pubKey: PubKey,
  params: ParamsConfig,
): Uint8Array {
  const unlimitedPoly = r3DecodeChunks(plaintext);
  const getU32 = () => rng.nextU32();
  const { chunks, size, seed } = r3SplitWChunks(unlimitedPoly, getU32, params);
  const encryptedBytes: Uint8Array[] = [];

  for (const chunk of chunks) {
    const r3 = R3.from(chunk, params);
    const hr = r3Encrypt(r3, pubKey, params);
    const rqBytes = hr.toBytes(params);
    encryptedBytes.push(rqBytes);
  }

  const totalLength = encryptedBytes.reduce((sum, arr) => sum + arr.length, 0);
  const dataBytes = new Uint8Array(totalLength);

  let offset = 0;

  for (const arr of encryptedBytes) {
    dataBytes.set(arr, offset);
    offset += arr.length;
  }

  return packBytes(dataBytes, size, seed);
}

function bytesDecrypt(
  cipher: Uint8Array,
  privKey: PrivKey,
  params: ParamsConfig,
): Uint8Array {
  const { dataBytes, size, seed } = unpackBytes(cipher);
  const chunkCount = Math.floor(dataBytes.length / params.RQ_BYTES);

  if (dataBytes.length % params.RQ_BYTES !== 0) {
    throw ErrorType.InvalidRqChunkSize;
  }

  const decryptedChunks: Int8Array[] = [];

  for (let i = 0; i < chunkCount; i++) {
    const start = i * params.RQ_BYTES;
    const end = start + params.RQ_BYTES;
    const chunkBytes = dataBytes.subarray(start, end);
    if (chunkBytes.length !== params.RQ_BYTES) {
      throw ErrorType.InvalidRqChunkSize;
    }
    const coeffs = bytesRqDecode(chunkBytes, params);
    const rq = Rq.from(coeffs, params);
    const r3 = rqDecrypt(rq, privKey, params);
    decryptedChunks.push(r3.coeffs);
  }

  const outR3 = r3MergeWChunks(decryptedChunks, size, seed, params);

  return r3EncodeChunks(outR3);
}

export function ntruKeysFromSeed(seedBytes: Uint8Array): {
  pk: PubKey;
  sk: PrivKey;
} {
  const seedPq = seedBytes.slice(0, 32);
  const pqRng = ChaCha20Rng(seedPq);

  return generateKeyPair(pqRng, NTRU_CONFIG);
}

export function ntruEncrypt(pk: PubKey, plaintext: Uint8Array) {
  const seed = randomBytes(32);
  const rng = ChaCha20Rng(seed);
  return bytesEncrypt(rng, plaintext, pk, NTRU_CONFIG);
}

export function ntruDecrypt(sk: PrivKey, ciphertext: Uint8Array) {
  return bytesDecrypt(ciphertext, sk, NTRU_CONFIG);
}
