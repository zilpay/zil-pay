import { test, expect } from 'vitest';
import { Cipher } from '../../crypto/aes256';
import { ErrorMessages } from '../../config/errors';

test('encrypt encrypts data and decrypt successfully recovers it', () => {
  const key = new TextEncoder().encode('1234567890123456'); // 16-byte key
  const content = new TextEncoder().encode('Hello, ZilPay!');

  const encrypted = Cipher.encrypt(content, key);
  const decrypted = Cipher.decrypt(encrypted, key);

  expect(new TextDecoder().decode(decrypted)).toBe('Hello, ZilPay!');
});

test('decrypt with wrong key does not return original content', () => {
  const key = new TextEncoder().encode('correctKey123456'); // 16-byte key
  const wrongKey = new TextEncoder().encode('wrongKey12345678'); // 16-byte key

  const content = new TextEncoder().encode('Secret message');
  const encrypted = Cipher.encrypt(content, key);

  const decrypted = Cipher.decrypt(encrypted, wrongKey);

  expect(decrypted).not.toEqual(content);
  expect(new TextDecoder().decode(decrypted)).not.toBe(
    new TextDecoder().decode(content)
  );
});

test('encrypt throws if key length is invalid', () => {
  const invalidKey = new TextEncoder().encode('shortkey'); // <16 bytes
  const content = new TextEncoder().encode('Data');

  expect(() => Cipher.encrypt(content, invalidKey)).toThrowError(
    ErrorMessages.InvalidKeyLength
  );
});
