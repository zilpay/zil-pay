import { randomBytes } from "./random";

/**
 * Generates a version 4 UUID.
 * Uses the native `crypto.randomUUID` if available, otherwise falls back to a
 * custom implementation using the `randomBytes` function.
 * @returns A UUID string.
 */
export function uuid(): string {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  const bytes = randomBytes(16);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
}
