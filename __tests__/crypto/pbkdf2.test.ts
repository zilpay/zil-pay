
import { test, expect, vi } from 'vitest';
import { pbkdf2 } from '../../crypto/pbkdf2';
import { ShaAlgorithms } from '../../config/pbkdf2';
import { utils } from 'aes-js';

test('pbkdf2 calls Web Crypto API correctly with default SHA-512', async () => {
  const password = new TextEncoder().encode('password');
  const salt = new TextEncoder().encode('salt');
  const iterations = 1000;
  const result = await pbkdf2(password, salt, iterations, ShaAlgorithms.Sha512);
  const shouldBe = "afe6c5530785b6cc6b1c6453384731bd5ee432ee549fd42fb6695779ad8a1c5bf59de69c48f774efc4007d5298f9033c0241d5ab69305e7b64eceeb8d834cfec";
 
  expect(utils.hex.fromBytes(result)).toBe(shouldBe);
});
