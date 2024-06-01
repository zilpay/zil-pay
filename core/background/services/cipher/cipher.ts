/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { AccountController } from 'core/background/services/account';
import type { CipherState, InputCipherParams } from 'types/cipher';
import type { BadgeControl } from '../badge';

import assert from 'assert';
import { lib } from 'crypto-js';
import aes from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import Hex from 'crypto-js/enc-hex';
import Base64 from 'crypto-js/enc-base64';
import { ErrorMessages } from 'config/errors';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { OldAes } from 'lib/crypto/aes';

export enum AesMethod {
  Aes128,
  Aes256
}

export class CipherControl {
  #method = AesMethod.Aes128;

  #encryptParams?: InputCipherParams;
  #decryptParams?: InputCipherParams;

  readonly #account: AccountController;
  readonly #badge: BadgeControl;

  get encryptParams() {
    return this.#encryptParams;
  }

  get method() {
    return this.#method;
  }

  get decryptParams() {
    return this.#decryptParams;
  }

  get state(): CipherState {
    return {
      encryptParams: this.encryptParams,
      decryptParams: this.decryptParams
    };
  }

  constructor(account: AccountController, badge: BadgeControl) {
    this.#account = account;
    this.#badge = badge;
  }

  async addEncryption(params: InputCipherParams) {
    assert(params.content, ErrorMessages.IncorrectParams);
    assert(params.uuid, ErrorMessages.IncorrectParams);
    assert(params.icon, ErrorMessages.IncorrectParams);
    assert(params.title, ErrorMessages.IncorrectParams);
    assert(params.domain, ErrorMessages.IncorrectParams);

    this.#encryptParams = params;

    await BrowserStorage.set(
      buildObject(Fields.ENCRYPT_DATA, JSON.stringify(params))
    );
    await this.#badge.increase();
  }

  async addDecryption(params: InputCipherParams) {
    assert(params.content, ErrorMessages.IncorrectParams);
    assert(params.uuid, ErrorMessages.IncorrectParams);
    assert(params.icon, ErrorMessages.IncorrectParams);
    assert(params.title, ErrorMessages.IncorrectParams);
    assert(params.domain, ErrorMessages.IncorrectParams);

    this.#decryptParams = params;

    await BrowserStorage.set(
      buildObject(Fields.DECRYPT_DATA, JSON.stringify(params))
    );
    await this.#badge.increase();
  }

  async removeEncryption() {
    this.#encryptParams = undefined;
    await BrowserStorage.rm(Fields.ENCRYPT_DATA);
    await this.#badge.decrease();
  }

  async removeDecryption() {
    this.#decryptParams = undefined;
    await BrowserStorage.rm(Fields.DECRYPT_DATA);
    await this.#badge.decrease();
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.ENCRYPT_DATA,
      Fields.DECRYPT_DATA
    );

    try {
      if (data && data[Fields.ENCRYPT_DATA]) {
        this.#encryptParams = JSON.parse(data[Fields.ENCRYPT_DATA]);
      }
    } catch {
      ///
    }

    try {
      if (data && data[Fields.DECRYPT_DATA]) {
        this.#decryptParams = JSON.parse(data[Fields.DECRYPT_DATA]);
      }
    } catch {
      ///
    }

    if (this.#decryptParams || this.#encryptParams) {
      this.#badge.increase();
    }
  }

  async encrypt(index: number) {
    const { privKey } = await this.#account.getKeyPair(index);
    const keyAsHex = Hex.parse(privKey);
    const bytes = Hex.parse(OldAes.hash(this.encryptParams.domain));
    const counter = lib.WordArray.random(128 / 8);
    const iv = counter.concat(bytes);
    const encryptData = aes.encrypt(
      this.encryptParams.content,
      keyAsHex,
      { iv }
    );

    return `${encryptData.ciphertext.toString(Base64)}:${counter.toString(Base64)}`;
  }

  async decrypt(index: number) {
    const { privKey } = await this.#account.getKeyPair(index);
    const [cipher, counter] = this.decryptParams.content.split(':');
    const bytes = Hex.parse(OldAes.hash(this.decryptParams.domain));
    const iv = Base64.parse(counter).concat(bytes);
    const decrypted = aes.decrypt(
      cipher,
      Hex.parse(privKey),
      { iv }
    );
    const content = decrypted.toString(Utf8);

    assert(Boolean(content), ErrorMessages.InvalidDecryption);

    return content;
  }
}
