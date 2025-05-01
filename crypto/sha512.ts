import { ShaAlgorithms } from "config/pbkdf2";

export async function sha512(value: Uint8Array) {
  const crypto = globalThis.crypto;
  return crypto.subtle.digest(ShaAlgorithms.Sha512, value);
}
