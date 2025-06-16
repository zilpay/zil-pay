import { describe, it, expect } from "vitest";
import { utf8ToUint8Array, uint8ArrayToUtf8 } from "../../lib/utils/utf8";

describe("UTF-8 Conversion", () => {
  it("should convert a simple string to a Uint8Array", () => {
    const str = "hello";
    const expected = new Uint8Array([104, 101, 108, 108, 111]);
    expect(utf8ToUint8Array(str)).toEqual(expected);
  });

  it("should convert a Uint8Array to a simple string", () => {
    const arr = new Uint8Array([104, 101, 108, 108, 111]);
    const expected = "hello";
    expect(uint8ArrayToUtf8(arr)).toBe(expected);
  });

  it("should handle an empty string", () => {
    const str = "";
    const expected = new Uint8Array([]);
    expect(utf8ToUint8Array(str)).toEqual(expected);
  });

  it("should handle an empty Uint8Array", () => {
    const arr = new Uint8Array([]);
    const expected = "";
    expect(uint8ArrayToUtf8(arr)).toBe(expected);
  });

  it("should correctly handle special UTF-8 characters", () => {
    const str = "ZilPay ❤️ криптография";
    const expected = new Uint8Array([
      90, 105, 108, 80, 97, 121, 32, 226, 157, 164, 239, 184, 143, 32, 208, 186,
      209, 128, 208, 184, 208, 191, 209, 130, 208, 190, 208, 179, 209, 128, 208,
      176, 209, 132, 208, 184, 209, 143,
    ]);
    expect(utf8ToUint8Array(str)).toEqual(expected);
  });

  it("should perform a round-trip conversion correctly", () => {
    const originalStr =
      "This is a test string with various characters: !@#$%^&*()_+";
    const uint8Array = utf8ToUint8Array(originalStr);
    const finalStr = uint8ArrayToUtf8(uint8Array);
    expect(finalStr).toBe(originalStr);
  });
});
