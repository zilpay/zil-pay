import { test, expect } from 'vitest';
import { sha256 } from '../../crypto/sha256';
import { utils } from 'aes-js';

test('sha256 hashes "test" correctly', async () => {
  const input = new TextEncoder().encode('test');
  const hash = await sha256(input);
  const hexString = utils.hex.fromBytes(hash);

  expect(hexString).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
});
