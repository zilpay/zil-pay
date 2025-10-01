import { ShaAlgorithms } from "../config/pbkdf2";

export async function sha512(value: Uint8Array): Promise<Uint8Array> {
  const crypto = globalThis.crypto;
  const hash = await crypto.subtle.digest(ShaAlgorithms.Sha512, value as BufferSource);

  return new Uint8Array(hash);
}
