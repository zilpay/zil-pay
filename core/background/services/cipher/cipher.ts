import type { InputCipherParams } from 'types/cipher';

import assert from 'assert';
import { lib } from 'crypto-js';
import aes from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import Hex from 'crypto-js/enc-hex';
import Base64 from 'crypto-js/enc-base64';
import { ErrorMessages } from 'config/errors';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { Aes } from 'lib/crypto/aes';
import { NotificationsControl } from 'core/background/services/notifications';


export class CipherControl {
  #encryptParams?: InputCipherParams;
  #decryptParams?: InputCipherParams;

  get encryptParams() {
    return this.#encryptParams;
  }

  get decryptParams() {
    return this.#decryptParams;
  }

  async addEncryption(params: InputCipherParams) {
    assert(params.content, ErrorMessages.IncorrectParams);
    assert(params.uuid, ErrorMessages.IncorrectParams);
    assert(params.icon, ErrorMessages.IncorrectParams);
    assert(params.title, ErrorMessages.IncorrectParams);
    assert(params.domain, ErrorMessages.IncorrectParams);

    this.#encryptParams = params;
    this.#counter();

    await BrowserStorage.set(
      buildObject(Fields.ENCRYPT_DATA, JSON.stringify(params))
    );
  }

  async addDecryption(params: InputCipherParams) {
    assert(params.content, ErrorMessages.IncorrectParams);
    assert(params.uuid, ErrorMessages.IncorrectParams);
    assert(params.icon, ErrorMessages.IncorrectParams);
    assert(params.title, ErrorMessages.IncorrectParams);
    assert(params.domain, ErrorMessages.IncorrectParams);

    this.#decryptParams = params;
    this.#counter();

    await BrowserStorage.set(
      buildObject(Fields.DECRYPT_DATA, JSON.stringify(params))
    );
  }

  async removeEncryption() {
    this.#encryptParams = undefined;
    this.#counter();
    await BrowserStorage.rm(Fields.ENCRYPT_DATA);
  }

  async removeDecryption() {
    this.#decryptParams = undefined;
    this.#counter();
    await BrowserStorage.rm(Fields.DECRYPT_DATA);
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

    this.#counter();
  }

  encrypt(privateKey: string) {
    const keyAsHex = Hex.parse(privateKey);
    const bytes = Hex.parse(Aes.hash(this.encryptParams.domain));
    const counter = lib.WordArray.random(128 / 8);
    const iv = counter.concat(bytes);
    const encryptData = aes.encrypt(
      this.encryptParams.content,
      keyAsHex,
      { iv }
    );

    return `${encryptData.ciphertext.toString(Base64)}:${counter.toString(Base64)}`;
  }

  decrypt(privateKey: string) {
    const [cipher, counter] = this.decryptParams.content.split(':');
    const bytes = Hex.parse(Aes.hash(this.encryptParams.domain));
    const iv = Base64.parse(counter).concat(bytes);
    const decrypted = aes.decrypt(
      cipher,
      Hex.parse(privateKey),
      { iv }
    );

    return decrypted.toString(Utf8);
  }

  #counter() {
    let counter = 0;

    if (this.decryptParams) {
      counter++;
    }

    if (this.encryptParams) {
      counter++;
    }

    if (counter > 0) {
      NotificationsControl.counter(counter);
    }
  }
}
