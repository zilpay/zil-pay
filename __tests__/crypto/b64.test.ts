import { describe, it, expect } from "vitest";
import { base64ToUint8Array, uint8ArrayToBase64 } from "../../crypto/b64";

describe("base64 Conversion Functions", () => {
  describe("base64ToUint8Array", () => {
    it("converts valid base64 string to Uint8Array", () => {
      const base64 = "SGVsbG8="; // "Hello"
      const expected = new Uint8Array([72, 101, 108, 108, 111]);
      expect(base64ToUint8Array(base64)).toEqual(expected);
    });

    it("handles empty base64 string", () => {
      expect(base64ToUint8Array("")).toEqual(new Uint8Array([]));
    });

    it("throws error for invalid base64 string", () => {
      expect(() => base64ToUint8Array("invalid!")).toThrow(
        "Invalid base64 string",
      );
    });
  });

  describe("uint8ArrayToBase64", () => {
    it("converts Uint8Array to valid base64 string", () => {
      const uint8Array = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      expect(uint8ArrayToBase64(uint8Array)).toBe("SGVsbG8=");
    });

    it("handles empty Uint8Array", () => {
      expect(uint8ArrayToBase64(new Uint8Array([]))).toBe("");
    });
  });

  describe("round-trip conversion", () => {
    it("converts base64 to Uint8Array and back", () => {
      const original = "SGVsbG8=";
      const uint8Array = base64ToUint8Array(original);
      expect(uint8ArrayToBase64(uint8Array)).toBe(original);
    });

    it("converts Uint8Array to base64 and back", () => {
      const original = new Uint8Array([72, 101, 108, 108, 111]);
      const base64 = uint8ArrayToBase64(original);
      expect(base64ToUint8Array(base64)).toEqual(original);
    });
  });
});
