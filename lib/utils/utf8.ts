import { hexToUint8Array, HEX_PREFIX } from "lib/utils/hex";

export function utf8ToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function uint8ArrayToUtf8(arr: Uint8Array): string {
  return new TextDecoder().decode(arr);
}

export function tryHexToUtf8(hex: string): string {
  const decoded = uint8ArrayToUtf8(hexToUint8Array(hex));
  return decoded.includes('\uFFFD') ? hex : decoded;
}

export function messageToUint8Array(message: string): Uint8Array {
  return message.startsWith(HEX_PREFIX) ? hexToUint8Array(message) : utf8ToUint8Array(message);
}
