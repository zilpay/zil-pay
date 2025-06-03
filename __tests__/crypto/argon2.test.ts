import { describe, expect, it } from "vitest";
import { deriveArgon2Key } from '../../crypto/argon2';
import { Config } from "@hicaru/argon2-pure.js";

describe("argon2", () => {
  it("should shuffle an array of numbers", () => {
    deriveArgon2Key(new Uint8Array([]), "", Config.owasp1());
  });
});
