import { test, expect } from "vitest";
import { sha512 } from "../../crypto/sha512";
import { utils } from "aes-js";

test('sha512 hashes "test" correctly', async () => {
  const input = new TextEncoder().encode("test");
  const buffer = await sha512(input);
  const hashArray = new Uint8Array(buffer);
  const hexString = utils.hex.fromBytes(hashArray);
  expect(hexString).toBe(
    "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff",
  );
});
