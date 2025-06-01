import { describe, it, expect } from 'vitest';
import { derivePrivateKey } from '../../crypto/bip32';
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
