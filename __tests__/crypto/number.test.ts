import { describe, expect, it } from "vitest";
import {
  uint8ArrayToBigIntBigEndian,
  uint8ArrayToBigIntLittleEndian,
} from "../../crypto/number";
import { randomBytes } from "../../crypto/random";
import { hashXORHex, hashXOR } from "../../lib/utils/hashing";

describe("uint8ArrayToBigIntBigEndian", () => {
  it("should correctly convert a non-empty big-endian Uint8Array to bigint", () => {
    const length = 8;
    const byteArray = randomBytes(length);
    const bigIntValue = uint8ArrayToBigIntBigEndian(byteArray);
    expect(typeof bigIntValue).toBe("bigint");
  });

  it("should return 0n for an empty Uint8Array", () => {
    const emptyArray = new Uint8Array([]);
    expect(uint8ArrayToBigIntBigEndian(emptyArray)).toBe(0n);
  });
});

describe("uint8ArrayToBigIntLittleEndian", () => {
  it("should correctly convert a non-empty little-endian Uint8Array to bigint", () => {
    const length = 8;
    const byteArray = randomBytes(length);
    const littleEndianArray = new Uint8Array([...byteArray].reverse());
    const bigIntValue = uint8ArrayToBigIntLittleEndian(littleEndianArray);
    expect(typeof bigIntValue).toBe("bigint");
  });

  it("should return 0n for an empty Uint8Array", () => {
    const emptyArray = new Uint8Array([]);
    expect(uint8ArrayToBigIntLittleEndian(emptyArray)).toBe(0n);
  });
});

describe("hashXOR and hashXORHex", () => {
  it("should return the same value for Uint8Array and its hex representation", () => {
    const length = 8;
    const byteArray = randomBytes(length);
    const hex = Array.from(byteArray).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashFromArray = hashXOR(byteArray);
    const hashFromHex = hashXORHex(hex);
    expect(hashFromArray).toBe(hashFromHex);
  });

  it("should return 0 for empty Uint8Array and empty hex string", () => {
    const emptyArray = new Uint8Array([]);
    const emptyHex = '';
    expect(hashXOR(emptyArray)).toBe(0);
    expect(hashXORHex(emptyHex)).toBe(0);
  });
});
