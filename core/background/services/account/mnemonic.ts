/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import wordlist from 'bip39/src/wordlists/english.json';
import { randomBytes } from 'lib/crypto/random';
import sha256 from 'hash.js/lib/hash/sha/256';
import { pbkdf2 } from 'pbkdf2';
import { Buffer } from 'buffer';
import { HDKey } from './hd-key';

const INVALID_ENTROPY = -1;
const WORDLIST_REQUIRED = -2;

export class MnemonicController {

  public generateMnemonic(strength = 128) {
    strength = strength || 128;
    if (strength % 32 !== 0) {
        throw INVALID_ENTROPY;
    }
    return this._entropyToMnemonic(randomBytes(strength / 8), wordlist);
  }

  public getKey(index: number) {
    return `m/44'/313'/0'/0/${index}`;
  }

  public mnemonicToSeed(mnemonic: string, password?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const callback = (err: Error, derivedKey: Buffer) => {
        if (err) {
          return reject(err);
        }
        else {
          return resolve(derivedKey);
        }
      };

      const mnemonicBuffer = Buffer.from(this._normalize(mnemonic));
      const saltBuffer = Buffer.from(this._salt(this._normalize(password)));

      pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512', callback);
    });
  }

  private _entropyToMnemonic(entropy: string, wordlist: string[]) {
    const bufferEntropy = Buffer.from(entropy, 'hex');

    if (!wordlist) {
      throw WORDLIST_REQUIRED;
    }
    // 128 <= ENT <= 256
    if (bufferEntropy.length < 16) {
      throw INVALID_ENTROPY;
    }
    if (bufferEntropy.length > 32) {
      throw INVALID_ENTROPY;
    }
    if (bufferEntropy.length % 4 !== 0) {
      throw INVALID_ENTROPY;
    }

    const entropyBits = this._bytesToBinary(Array.from(bufferEntropy));
    const checksumBits = this._deriveChecksumBits(bufferEntropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g);
    const words = chunks.map((binary) => {
        const index = this._binaryToByte(binary);
        return wordlist[index];
    });

    return words.join(' ');
  }

  private _bytesToBinary(bytes: number[]) {
    return bytes.map((x) => this._lpad(x.toString(2), '0', 8)).join('');
  }

  private _salt(password: string) {
    return 'mnemonic' + (password || '');
  }

  private _normalize(str: string) {
    return (str || '').normalize('NFKD');
  }

  private _lpad(str: string, padString: string, length: number) {
    while (str.length < length) {
        str = padString + str;
    }
    return str;
  }

  private _binaryToByte(bin: string) {
    return parseInt(bin, 2);
  }

  private _deriveChecksumBits(entropyBuffer: Buffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = sha256()
      .update(entropyBuffer)
      .digest('hex');

    return this._bytesToBinary(Array.from(hash)).slice(0, CS);
  }
}
