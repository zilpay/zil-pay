/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import aes from 'crypto-js/aes';
import { lib } from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import Utf8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';
import ENCHex from 'crypto-js/enc-hex';

export const Aes = Object.freeze({

  /**
   * Create sha256 hash string.
   * @example
   * new Aes().hash('my any string';
   */
  hash(content: string) {
    return sha256(content).toString();
  },

  /**
   * Ecnrypt payload through password.
   */
  encrypt<T>(data: object | Array<T>, key: string) {
    return aes
      .encrypt(JSON.stringify(data), key)
      .toString();
  },

  /**
   * Encrypt data and return the object of AES.
   */
  getEncrypted<T>(data: object | Array<T>, key: string) {
    const content = JSON.stringify(data);
    const keyAsHex = ENCHex.parse(key);
    const iv = lib.WordArray.random(128 / 8);
    const encryptData = aes.encrypt(
      content,
      keyAsHex,
      { iv: iv }
    );

    return {
      iv: encryptData.iv.toString(),
      cipher: encryptData.ciphertext.toString(Base64)
    };
  },

  /**
   * Decrypt payload through password.
   */
  decrypt(data: string, key: string) {
    const decrypted = aes.decrypt(data, key);
    const content = decrypted.toString(Utf8);

    return JSON.parse(content);
  }
});
