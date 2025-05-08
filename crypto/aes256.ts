import { Counter, ModeOfOperation, utils } from 'aes-js';
import { ErrorMessages } from '../config/errors';
import { randomBytes } from 'crypto/random';
import { assert } from 'lib/runtime/assert';

export const Cipher = Object.freeze({
  encrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
    assert(Boolean(content), ErrorMessages.IncorrectParams);
    assert(Boolean(key), ErrorMessages.IncorrectParams);
    
    if (![16, 24, 32].includes(key.length)) {
      throw new Error(ErrorMessages.InvalidKeyLength);
    }

    const entropy = randomBytes(16);
    const iv = new Counter(entropy);
    const aesCtr = new ModeOfOperation.ctr(key, iv);
    const encrypted = aesCtr.encrypt(content);
    const bytes = utils.utf8.toBytes(
      `${utils.hex.fromBytes(encrypted)}/${utils.hex.fromBytes(entropy)}`
    );
    return bytes;
  },
  decrypt(bytes: Uint8Array, key: Uint8Array): Uint8Array {
    assert(Boolean(bytes), ErrorMessages.IncorrectParams);
    assert(Boolean(key), ErrorMessages.IncorrectParams);

    if (![16, 24, 32].includes(key.length)) {
      throw new Error(ErrorMessages.InvalidKeyLength);
    }

    const [encrypted, iv] = utils.utf8.fromBytes(bytes).split('/');
    const counter = new Counter(utils.hex.toBytes(iv));
    const aesCtr = new ModeOfOperation.ctr(key, counter);
    return aesCtr.decrypt(utils.hex.toBytes(encrypted));
  }
});
