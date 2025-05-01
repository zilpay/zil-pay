import { test, expect, vi } from 'vitest';
import { randomBytes } from '../../crypto/random';

test('randomBytes generates a Uint8Array of the specified length', () => {
  const length = 16;
  const result = randomBytes(length);
  
  expect(result).toBeInstanceOf(Uint8Array);
  expect(result.length).toBe(length);
});

test('randomBytes uses window.crypto.getRandomValues to seed the ChaCha20 RNG', () => {
  const spyGetRandomValues = vi.spyOn(window.crypto, 'getRandomValues');
  const length = 8;
  
  randomBytes(length);
  
  expect(spyGetRandomValues).toHaveBeenCalled();
  spyGetRandomValues.mockRestore();
});
