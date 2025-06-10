import { Config, hashRaw } from "@hicaru/argon2-pure.js";
import { WALLET_SALT } from "../config/argon2";

export type Argon2Config = Config;

export function deriveArgon2Key(
  password: Uint8Array,
  saltBytes: Uint8Array,
  config: Argon2Config,
) {
  const combinedSalt = new Uint8Array(saltBytes.length + WALLET_SALT.length);

  combinedSalt.set(saltBytes, 0);
  combinedSalt.set(WALLET_SALT, saltBytes.length);

  const hash = hashRaw(password, combinedSalt, config);

  return hash;
}
