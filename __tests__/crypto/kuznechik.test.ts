import { describe, test, expect } from 'vitest';
import { kuznechik_encrypt, kuznechik_decrypt } from '../../crypto/kuznechik';
import { MIN_GAMMA_SIZE } from '@hicaru/kuznechik.js';

describe('kuznechik_encrypt and kuznechik_decrypt', () => {
  const key = new Uint8Array(32).fill(0x01);
  const plaintext = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  test('encrypt and decrypt should return original plaintext', () => {
    const ciphertext = kuznechik_encrypt(key, plaintext);
    const decrypted = kuznechik_decrypt(key, ciphertext);
    expect(decrypted).toEqual(plaintext);
  });

  test('ciphertext length should be plaintext length plus MIN_GAMMA_SIZE', () => {
    const ciphertext = kuznechik_encrypt(key, plaintext);
    expect(ciphertext.length).toBe(plaintext.length + MIN_GAMMA_SIZE);
  });

  test('encrypt and decrypt empty plaintext', () => {
    const emptyPlaintext = new Uint8Array(0);
    const ciphertext = kuznechik_encrypt(key, emptyPlaintext);
    expect(ciphertext.length).toBe(MIN_GAMMA_SIZE);
    const decrypted = kuznechik_decrypt(key, ciphertext);
    expect(decrypted).toEqual(emptyPlaintext);
  });

  test('decrypt with short ciphertext should throw error', () => {
    const shortCiphertext = new Uint8Array(MIN_GAMMA_SIZE - 1);
    expect(() => kuznechik_decrypt(key, shortCiphertext)).toThrow();
  });

  test('encrypt with invalid key size should throw error', () => {
    const invalidKey = new Uint8Array(31); 
    expect(() => kuznechik_encrypt(invalidKey, plaintext)).toThrow();
  });

  test('decrypt with different key should not return original plaintext', () => {
    const differentKey = new Uint8Array(32).fill(0x02);
    const ciphertext = kuznechik_encrypt(key, plaintext);
    const decrypted = kuznechik_decrypt(differentKey, ciphertext);
    expect(decrypted).not.toEqual(plaintext);
  });
});
