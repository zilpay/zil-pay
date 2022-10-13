/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import assert from 'assert';
import aes from 'crypto-js/aes';
import { lib } from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import Utf8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';
import ENCHex from 'crypto-js/enc-hex';
import { ErrorMessages } from 'config/errors';

export class Aes  {
  /**
   * Create sha256 hash string.
   * @example
   * new Aes().hash('my any string';
   */
  public static hash(content: string) {
    assert(Boolean(content), ErrorMessages.IncorrectParams);
    return sha256(content).toString();
  }

  public static encrypt(data: string, key: string) {
    assert(Boolean(data), ErrorMessages.IncorrectParams);
    assert(Boolean(key), ErrorMessages.IncorrectParams);

    return aes
      .encrypt(data, key)
      .toString();
  }

  public static getEncrypted<T>(data: object | Array<T>, key: string) {
    const hash = Aes.hash(key);
    const content = JSON.stringify(data);
    const keyAsHex = ENCHex.parse(hash);
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
  }

  public static decrypt(data: string, key: string) {
    assert(Boolean(data), ErrorMessages.IncorrectParams);
    assert(Boolean(key), ErrorMessages.IncorrectParams);

    const decrypted = aes.decrypt(data, key);
    const content = decrypted.toString(Utf8);

    assert(Boolean(content), ErrorMessages.IncorrectPassword);

    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }
}
