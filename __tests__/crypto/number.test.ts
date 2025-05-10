import { describe, expect, it } from 'vitest';
import { uint8ArrayToBigIntBigEndian, uint8ArrayToBigIntLittleEndian } from '../../crypto/number';
import { randomBytes } from '../../crypto/random';

describe('uint8ArrayToBigIntBigEndian', () => {
  it('should correctly convert a non-empty big-endian Uint8Array to bigint', () => {
    const length = 8;
    const byteArray = randomBytes(length);
    const bigIntValue = uint8ArrayToBigIntBigEndian(byteArray);
    expect(typeof bigIntValue).toBe('bigint');
  });

  it('should return 0n for an empty Uint8Array', () => {
    const emptyArray = new Uint8Array([]);
    expect(uint8ArrayToBigIntBigEndian(emptyArray)).toBe(0n);
  });
});

describe('uint8ArrayToBigIntLittleEndian', () => {
  it('should correctly convert a non-empty little-endian Uint8Array to bigint', () => {
    const length = 8;
    const byteArray = randomBytes(length);
    const littleEndianArray = new Uint8Array([...byteArray].reverse());
    const bigIntValue = uint8ArrayToBigIntLittleEndian(littleEndianArray);
    expect(typeof bigIntValue).toBe('bigint');
  });

  it('should return 0n for an empty Uint8Array', () => {
    const emptyArray = new Uint8Array([]);
    expect(uint8ArrayToBigIntLittleEndian(emptyArray)).toBe(0n);
  });
});
