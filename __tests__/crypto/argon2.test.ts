import { describe, expect, it } from "vitest";
import { deriveArgon2Key } from "../../crypto/argon2";
import { Config, Variant, Version } from "@hicaru/argon2-pure.js";
import { APP_ID } from "../../config/argon2";
import { utf8ToUint8Array } from "../../lib/utils/utf8";

describe("argon2", () => {
  it("should derive the correct key", () => {
    const password = utf8ToUint8Array("test_password");
    const salt = utf8ToUint8Array("some_salt");
    const config = new Config(
      APP_ID,
      64,
      2,
      65536,
      new Uint8Array(),
      1,
      Variant.Argon2id,
      Version.Version13,
    );
    const key = deriveArgon2Key(password, salt, config);
    const expected = new Uint8Array([
      241, 5, 105, 168, 214, 152, 5, 38, 199, 60, 34, 215, 245, 198, 217, 49,
      108, 140, 86, 183, 92, 152, 168, 92, 64, 48, 241, 204, 238, 247, 198, 88,
      18, 126, 75, 177, 211, 74, 244, 234, 39, 92, 32, 255, 148, 131, 9, 175,
      213, 251, 48, 220, 238, 146, 16, 147, 132, 15, 46, 51, 176, 134, 238, 69,
    ]);

    expect(key).toEqual(expected);
  });
});
