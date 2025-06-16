import { describe, it, expect } from "vitest";
import {
  hasHexPrefix,
  stripHexPrefix,
  uint8ArrayToHex,
  hexToUint8Array,
  hexToBigInt,
} from "../../lib/utils/hex";

describe("Hex Utility Functions", () => {
  describe("hasHexPrefix", () => {
    it("should return true for lowercase prefix", () => {
      expect(hasHexPrefix("0x123")).toBe(true);
    });

    it("should return true for uppercase prefix", () => {
      expect(hasHexPrefix("0X123")).toBe(true);
    });

    it("should return false for no prefix", () => {
      expect(hasHexPrefix("123")).toBe(false);
    });

    it("should return false for an empty string", () => {
      expect(hasHexPrefix("")).toBe(false);
    });

    it("should return false when '0x' is in the middle", () => {
      expect(hasHexPrefix("120x34")).toBe(false);
    });
  });

  describe("stripHexPrefix", () => {
    it("should strip lowercase prefix", () => {
      expect(stripHexPrefix("0xabcdef")).toBe("abcdef");
    });

    it("should strip uppercase prefix", () => {
      expect(stripHexPrefix("0XABCDEF")).toBe("ABCDEF");
    });

    it("should not change a string without a prefix", () => {
      expect(stripHexPrefix("abcdef")).toBe("abcdef");
    });

    it("should handle an empty string", () => {
      expect(stripHexPrefix("")).toBe("");
    });
  });

  describe("uint8ArrayToHex", () => {
    it("should convert a Uint8Array to a hex string without prefix", () => {
      const arr = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      expect(uint8ArrayToHex(arr)).toBe("48656c6c6f");
    });

    it("should convert a Uint8Array to a hex string with prefix", () => {
      const arr = new Uint8Array([72, 101, 108, 108, 111]);
      expect(uint8ArrayToHex(arr, true)).toBe("0x48656c6c6f");
    });

    it("should handle an empty Uint8Array", () => {
      const arr = new Uint8Array([]);
      expect(uint8ArrayToHex(arr)).toBe("");
      expect(uint8ArrayToHex(arr, true)).toBe("0x");
    });

    it("should handle single-digit hex values correctly with padding", () => {
      const arr = new Uint8Array([1, 15, 16]);
      expect(uint8ArrayToHex(arr)).toBe("010f10");
    });
  });

  describe("hexToUint8Array", () => {
    it("should convert a hex string without prefix to a Uint8Array", () => {
      const hex = "48656c6c6f";
      const expected = new Uint8Array([72, 101, 108, 108, 111]);
      expect(hexToUint8Array(hex)).toEqual(expected);
    });

    it("should convert a hex string with prefix to a Uint8Array", () => {
      const hex = "0x48656c6c6f";
      const expected = new Uint8Array([72, 101, 108, 108, 111]);
      expect(hexToUint8Array(hex)).toEqual(expected);
    });
    
    it("should handle mixed-case hex strings", () => {
      const hex = "0x48eLLO"; // Invalid, but tests parser logic
      const hexMixed = "0x48656C6c6F";
      const expected = new Uint8Array([72, 101, 108, 108, 111]);
      expect(hexToUint8Array(hexMixed)).toEqual(expected);
    });

    it("should return an empty Uint8Array for an empty string", () => {
      expect(hexToUint8Array("")).toEqual(new Uint8Array());
    });
    
    it("should return an empty Uint8Array for '0x'", () => {
      expect(hexToUint8Array("0x")).toEqual(new Uint8Array());
    });

    it("should throw an error for an odd number of characters", () => {
      const hex = "0x123";
      expect(() => hexToUint8Array(hex)).toThrow(
        "Invalid hex string: must have an even number of characters."
      );
    });
  });

  describe("hexToBigInt", () => {
    it("should convert a simple hex string to a BigInt", () => {
      expect(hexToBigInt("ff")).toBe(255n);
    });

    it("should convert a hex string with prefix to a BigInt", () => {
      expect(hexToBigInt("0x100")).toBe(256n);
    });

    it("should handle a zero value", () => {
      expect(hexToBigInt("0x0")).toBe(0n);
    });

    it("should throw a SyntaxError for invalid hex", () => {
      expect(() => hexToBigInt("0xgg")).toThrow(SyntaxError);
    });
  });

  describe("Round-trip conversions", () => {
    it("should correctly convert Uint8Array -> hex -> Uint8Array", () => {
      const originalArray = new Uint8Array([0, 5, 10, 15, 250, 255]);
      const hex = uint8ArrayToHex(originalArray);
      const newArray = hexToUint8Array(hex);
      expect(newArray).toEqual(originalArray);
    });

    it("should correctly convert hex -> Uint8Array -> hex", () => {
      const originalHex = "abcdef1234567890";
      const array = hexToUint8Array(originalHex);
      const newHex = uint8ArrayToHex(array);
      expect(newHex).toBe(originalHex);
    });
  });
});
