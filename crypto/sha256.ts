import { ShaAlgorithms } from "config/pbkdf2";

export async function sha256(value: Uint8Array) {
  if (!(value instanceof Uint8Array)) {
    value = Uint8Array.from(value);
  }

  const crypto = globalThis.crypto;
  const hash = await crypto.subtle.digest(ShaAlgorithms.sha256, value);
  return new Uint8Array(hash);
}
