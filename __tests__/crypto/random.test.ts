import { test, expect, vi } from "vitest";
import { randomBytes } from "../../crypto/random";

test("randomBytes generates a non-zero Uint8Array of the specified length", () => {
  const length = 16;
  const result = randomBytes(length);

  expect(result).toBeInstanceOf(Uint8Array);
  expect(result.length).toBe(length);

  const zeroArray = new Uint8Array(length);
  expect(result).not.toEqual(zeroArray);

  expect(result.some((byte) => byte !== 0)).toBe(true);
});

test("randomBytes uses window.crypto.getRandomValues to seed the ChaCha20 RNG", () => {
  const spyGetRandomValues = vi.spyOn(window.crypto, "getRandomValues");
  const length = 8;

  randomBytes(length);

  expect(spyGetRandomValues).toHaveBeenCalled();
  spyGetRandomValues.mockRestore();
});
