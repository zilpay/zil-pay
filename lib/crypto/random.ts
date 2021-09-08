/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

/**
 * randomBytes
 *
 * Uses JS-native CSPRNG to generate a specified number of bytes.
 * NOTE: this method throws if no PRNG is available.
 *
 * @param {number} bytes
 * @returns {string}
 */
 export const randomBytes = (bytes: number) => {
  const b = Buffer.allocUnsafe(bytes);
  const n = b.byteLength;

  let crypto = global.crypto;
  if (crypto === undefined) {
    // @ts-ignore
    // for IE 11
    crypto = global.msCrypto;
  }

  const isNodeEnv = typeof process?.versions?.node === 'string';
  if (isNodeEnv) {
    // For node enviroment, use sodium-native
    // https://paragonie.com/blog/2016/05/how-generate-secure-random-numbers-in-various-programming-languages#nodejs-csprng

    const sodium = require('sodium-native');
    sodium.randombytes_buf(b);
  } else if (crypto && crypto.getRandomValues) {
    // For browser or web worker enviroment, use window.crypto.getRandomValues()
    // https://paragonie.com/blog/2016/05/how-generate-secure-random-numbers-in-various-programming-languages#js-csprng

    // limit of getRandomValues()
    // The requested length exceeds 65536 bytes.
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#exceptions
    const MAX_BYTES = 65536;
    for (let i = 0; i < n; i += MAX_BYTES) {
      crypto.getRandomValues(
        new Uint8Array(b.buffer, i + b.byteOffset, Math.min(n - i, MAX_BYTES)),
      );
    }
  } else {
    throw new Error('No secure random number generator available');
  }
  const randBz = new Uint8Array(
    b.buffer,
    b.byteOffset,
    b.byteLength / Uint8Array.BYTES_PER_ELEMENT,
  );

  let randStr = '';
  for (let i = 0; i < bytes; i++) {
    randStr += ('00' + randBz[i].toString(16)).slice(-2);
  }

  return randStr;
};