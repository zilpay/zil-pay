/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import assert from 'assert';
import wordlist from 'bip39/src/wordlists/english.json';
import { randomBytes } from 'lib/crypto/random';
import sha256 from 'hash.js/lib/hash/sha/256';
import { pbkdf2 } from 'pbkdf2';
import { Buffer } from 'buffer';
import { ErrorMessages } from 'config/errors';

export class MnemonicController {

  public generateMnemonic(strength = 128) {
    strength = strength || 128;
    assert(strength % 32 === 0, ErrorMessages.InvalidEntropy);
    return this.#entropyToMnemonic(randomBytes(strength / 8), wordlist);
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

      const mnemonicBuffer = Buffer.from(this.#normalize(mnemonic));
      const saltBuffer = Buffer.from(this.#salt(this.#normalize(password)));

      pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512', callback);
    });
  }

  public mnemonicToEntropy(mnemonic: string) {
    const words = this.#normalize(mnemonic).split(' ');
    assert(words.length >= 12, ErrorMessages.IncorrectMnemonic);
    assert(words.length % 3 === 0, ErrorMessages.IncorrectMnemonic);
    // convert word indices to 11 bit binary strings
    const bits = words.map((word) => {
      const index = wordlist.indexOf(word);
      assert(index !== -1, ErrorMessages.IncorrectMnemonic);
      return this.#lpad(index.toString(2), '0', 11);
    }).join('');
    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = entropyBits
      .match(/(.{1,8})/g)
      .map(this.#binaryToByte);
    assert(entropyBytes.length >= 16, ErrorMessages.InvalidEntropy);
    assert(entropyBytes.length <= 32, ErrorMessages.InvalidEntropy);
    assert(entropyBytes.length % 4 === 0, ErrorMessages.InvalidEntropy);
    const entropy = Buffer.from(entropyBytes);
    return entropy.toString('hex');
  }

  public validateMnemonic(mnemonic: string) {
    try {
      this.mnemonicToEntropy(mnemonic);
    } catch (e) {
      return false;
    }
    return true;
  }

  #entropyToMnemonic(entropy: string, wordlist: string[]) {
    const bufferEntropy = Buffer.from(entropy, 'hex');

    assert(Boolean(wordlist), ErrorMessages.WordListRequired);
    assert(Boolean(wordlist), ErrorMessages.WordListRequired);

    // 128 <= ENT <= 256
    assert(bufferEntropy.length >= 16, ErrorMessages.InvalidEntropy);
    assert(bufferEntropy.length <= 32, ErrorMessages.InvalidEntropy);
    assert(bufferEntropy.length % 4 === 0, ErrorMessages.InvalidEntropy);

    const entropyBits = this.#bytesToBinary(Array.from(bufferEntropy));
    const checksumBits = this.#deriveChecksumBits(bufferEntropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g);
    const words = chunks.map((binary) => {
        const index = this.#binaryToByte(binary);
        return wordlist[index];
    });

    return words.join(' ');
  }

  #bytesToBinary(bytes: number[]) {
    return bytes.map((x) => this.#lpad(x.toString(2), '0', 8)).join('');
  }

  #salt(password: string) {
    return 'mnemonic' + (password || '');
  }

  #normalize(str: string) {
    return (str || '').normalize('NFKD');
  }

  #lpad(str: string, padString: string, length: number) {
    while (str.length < length) {
        str = padString + str;
    }
    return str;
  }

  #binaryToByte(bin: string) {
    return parseInt(bin, 2);
  }

  #deriveChecksumBits(entropyBuffer: Buffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = sha256()
      .update(entropyBuffer)
      .digest('hex');

    return this.#bytesToBinary(Array.from(hash)).slice(0, CS);
  }
}
