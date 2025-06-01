import { describe, it, expect } from 'vitest';
import { derivePrivateKey, deriveChildKey, ChildNumber, Bip32Error, deriveMasterKey } from '../../crypto/bip32';
import { Bip39 } from '../../crypto/bip39';
import { WORD_LIST } from './word_list';
import { utils } from 'aes-js';

describe('BIP-32 Derivation', () => {
  it('should derive correct private key from BIP-39 mnemonic', async () => {
    const phrase = 'panda eyebrow bullet gorilla call smoke muffin taste mesh discover soft ostrich alcohol speed nation flash devote level hobby quick inner drive ghost inside';
    const expectedSecretKey = "ff1e68eb7bf2f48651c47ef0177eb815857322257c5894bb4cfd1176c9989314";
    const seed = await Bip39.mnemonicToSeed(phrase, '', WORD_LIST);
    const privateKey = await derivePrivateKey(seed, "m/44'/60'/0'/0/0");

    expect(utils.hex.fromBytes(privateKey)).toEqual(expectedSecretKey);
  });
});

describe('ChildNumber', () => {
  it('should correctly parse a hardened child number', () => {
    const childNumber = ChildNumber.fromString("44'");
    expect(childNumber.value).toBe(44 | 0x80000000);
    expect(childNumber.isHardened()).toBe(true);
  });

  it('should correctly parse a non-hardened child number', () => {
    const childNumber = ChildNumber.fromString("0");
    expect(childNumber.value).toBe(0);
    expect(childNumber.isHardened()).toBe(false);
  });

  it('should throw an error for invalid child number string', () => {
    expect(() => ChildNumber.fromString("invalid")).toThrow(Bip32Error);
  });

  it('should throw an error for negative child number', () => {
    expect(() => ChildNumber.fromString("-1")).toThrow(Bip32Error);
  });
});

describe('derivePrivateKey Error Handling', () => {
  it('should throw an error for invalid path', async () => {
    const seed = utils.hex.toBytes("000102030405060708090a0b0c0d0e0f");
    await expect(derivePrivateKey(seed, "invalid/path")).rejects.toThrow(Bip32Error);
  });

  it('should throw an error for invalid child number in path', async () => {
    const seed = utils.hex.toBytes("000102030405060708090a0b0c0d0e0f");
    await expect(derivePrivateKey(seed, "m/44'/invalid'/0'/0/0")).rejects.toThrow(Bip32Error);
  });
});
