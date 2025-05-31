import { pbkdf2 } from './pbkdf2';
import { ShaAlgorithms } from '../config/pbkdf2';
import { randomBytes } from './random';
import { assert } from '../lib/runtime/assert';
import { sha256 } from './sha256';

// BIP-39 constants
const ENTROPY_BITS = [128, 160, 192, 224, 256];
const PBKDF2_ITERATIONS = 2048;
const SEED_LENGTH = 64; // 512 bits

export interface Mnemonic {
  phrase: string;
  words: string[];
}

export enum Bip39Error {
  InvalidEntropy = 'Invalid entropy length. Must be 128, 160, 192, 224, or 256 bits.',
  InvalidMnemonic = 'Invalid mnemonic phrase.',
  InvalidWord = 'Mnemonic contains invalid word(s) not in wordlist.',
  InvalidWordCount = 'Invalid number of words. Must be 12, 15, 18, 21, or 24.',
  InvalidChecksum = 'Mnemonic checksum is invalid.',
}

export const Bip39 = Object.freeze({
  /**
   * Generates a BIP-39 mnemonic from random entropy.
   * @param entropyBits - Number of entropy bits (128, 160, 192, 224, or 256).
   * @returns A mnemonic object with phrase and words.
   * @throws Error if entropyBits is invalid.
   */
  async generateMnemonic(entropyBits: number = 128, wordList: string[]): Promise<Mnemonic> {
    assert(ENTROPY_BITS.includes(entropyBits), Bip39Error.InvalidEntropy);

    const entropyBytes = entropyBits / 8;
    const entropy = randomBytes(entropyBytes);
    const checksumBits = entropyBits / 32;
    const totalBits = entropyBits + checksumBits;
    const wordCount = totalBits / 11;

    // Compute SHA-256 checksum
    const hash = await sha256(entropy);
    const checksum = hash[0] >> (8 - checksumBits);

    // Combine entropy and checksum
    const entropyBitsStr = Array.from(entropy)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('');
    const checksumBitsStr = checksum.toString(2).padStart(checksumBits, '0');
    const bits = entropyBitsStr + checksumBitsStr;

    // Split into 11-bit chunks to select words
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const start = i * 11;
      const chunk = bits.slice(start, start + 11);
      const index = parseInt(chunk, 2);
      words.push(wordList[index]);
    }

    return {
      phrase: words.join(' '),
      words,
    };
  },

  /**
   * Validates a BIP-39 mnemonic phrase.
   * @param mnemonic - The mnemonic phrase to validate.
   * @returns True if valid, throws error otherwise.
   * @throws Error if mnemonic is invalid.
   */
  async validateMnemonic(mnemonic: string, wordList: string[]): Promise<boolean> {
    const words = mnemonic.trim().split(/\s+/);
    const wordCount = words.length;
    const validWordCounts = [12, 15, 18, 21, 24];

    assert(validWordCounts.includes(wordCount), Bip39Error.InvalidWordCount);

    // Verify all words are in wordlist
    for (const word of words) {
      assert(wordList.includes(word), Bip39Error.InvalidWord);
    }

    // Reconstruct entropy and checksum
    const bits = words
      .map(word => {
        const index = wordList.indexOf(word);
        return index.toString(2).padStart(11, '0');
      })
      .join('');

    const entropyBits = (wordCount * 11) - (wordCount / 3);
    const entropy = bits.slice(0, entropyBits);
    const checksum = bits.slice(entropyBits);

    // Convert entropy bits to bytes
    const entropyBytes = new Uint8Array(entropyBits / 8);
    for (let i = 0; i < entropyBytes.length; i++) {
      entropyBytes[i] = parseInt(entropy.slice(i * 8, (i + 1) * 8), 2);
    }

    // Verify checksum
    const hash = await sha256(entropyBytes);
    const computedChecksum = hash[0] >> (8 - (wordCount / 3));
    const expectedChecksum = parseInt(checksum, 2);

    assert(computedChecksum === expectedChecksum, Bip39Error.InvalidChecksum);

    return true;
  },

  /**
   * Derives a seed from a BIP-39 mnemonic using PBKDF2.
   * @param mnemonic - The mnemonic phrase.
   * @param passphrase - Optional passphrase (default: empty string).
   * @returns A 512-bit seed as Uint8Array.
   * @throws Error if mnemonic is invalid.
   */
  async mnemonicToSeed(mnemonic: string, passphrase: string = ''): Promise<Uint8Array> {
    assert(this.validateMnemonic(mnemonic), Bip39Error.InvalidMnemonic);

    const password = new TextEncoder().encode(mnemonic);
    const salt = new TextEncoder().encode(`mnemonic${passphrase}`);
    const seed = await pbkdf2(password, salt, PBKDF2_ITERATIONS, ShaAlgorithms.Sha512);

    assert(seed.length === SEED_LENGTH, 'Invalid seed length.');

    return seed;
  },

  /**
   * Converts a mnemonic to entropy.
   * @param mnemonic - The mnemonic phrase.
   * @returns The original entropy as Uint8Array.
   * @throws Error if mnemonic is invalid.
   */
  mnemonicToEntropy(mnemonic: string, wordList: string[]): Uint8Array {
    assert(this.validateMnemonic(mnemonic), Bip39Error.InvalidMnemonic);

    const words = mnemonic.trim().split(/\s+/);
    const wordCount = words.length;
    const entropyBits = (wordCount * 11) - (wordCount / 3);

    const bits = words
      .map(word => {
        const index = wordList.indexOf(word);
        return index.toString(2).padStart(11, '0');
      })
      .join('');

    const entropy = bits.slice(0, entropyBits);
    const entropyBytes = new Uint8Array(entropyBits / 8);
    for (let i = 0; i < entropyBytes.length; i++) {
      entropyBytes[i] = parseInt(entropy.slice(i * 8, (i + 1) * 8), 2);
    }

    return entropyBytes;
  },

  /**
   * Converts entropy to a BIP-39 mnemonic phrase.
   * @param entropy - The entropy as a Uint8Array (must be 16, 20, 24, 28, or 32 bytes).
   * @param wordList - The BIP-39 wordlist.
   * @returns A mnemonic object with phrase and words.
   * @throws Error if entropy length is invalid.
   */
  async entropyToMnemonic(entropy: Uint8Array, wordList: string[]): Promise<Mnemonic> {
    const entropyBits = entropy.length * 8;
    assert(ENTROPY_BITS.includes(entropyBits), Bip39Error.InvalidEntropy);

    const checksumBits = entropyBits / 32;
    const totalBits = entropyBits + checksumBits;
    const wordCount = totalBits / 11;

    // Compute SHA-256 checksum
    const hash = await sha256(entropy);
    const checksum = hash[0] >> (8 - checksumBits);

    // Combine entropy and checksum
    const entropyBitsStr = Array.from(entropy)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('');
    const checksumBitsStr = checksum.toString(2).padStart(checksumBits, '0');
    const bits = entropyBitsStr + checksumBitsStr;

    // Split into 11-bit chunks to select words
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const start = i * 11;
      const chunk = bits.slice(start, start + 11);
      const index = parseInt(chunk, 2);
      words.push(wordList[index]);
    }

    return {
      phrase: words.join(' '),
      words,
    };
  },
});
