import { sha256 } from 'crypto/sha256';
import { utils } from 'aes-js';

/**
 * Checks if a string starts with the '0x' prefix (case-insensitive).
 *
 * @param str The string to check.
 * @returns True if the string starts with '0x', false otherwise.
 */
export function hasHexPrefix(str: string): boolean {
  return str.toLowerCase().startsWith('0x');
}

/**
 * Calculates the checksummed hexadecimal address from a byte array.
 *
 * @param addressBytes The address as a Uint8Array.
 * @returns The checksummed hexadecimal address string with the '0x' prefix.
 */
export async function toChecksumBytesAddress(addressBytes: Uint8Array): Promise<string> {
  const addressHex = utils.hex.fromBytes(addressBytes);
  const hashBytes = await sha256(addressBytes);
  const hashBigInt = BigInt(`0x${utils.hex.fromBytes(hashBytes)}`);
  let checksumAddress = '0x';

  for (let i = 0; i < addressHex.length; i++) {
    const char = addressHex[i];
    if (/[0-9]/.test(char)) {
      checksumAddress += char;
    } else {
      const bitPosition = BigInt(255 - 6 * i);
      const mask = BigInt(2) ** bitPosition;
      const shouldBeUpper = (hashBigInt & mask) >= BigInt(1);

      if (shouldBeUpper) {
        checksumAddress += char.toUpperCase();
      } else {
        checksumAddress += char.toLowerCase();
      }
    }
  }

  return checksumAddress;
}

/**
 * Calculates the checksummed hexadecimal address from a hexadecimal string.
 *
 * @param address The hexadecimal address string, optionally with the '0x' prefix.
 * @returns The checksummed hexadecimal address string with the '0x' prefix.
 */
export async function toChecksumHexAddress(address: string): Promise<string> {
  let lowerCaseAddress = address.toLowerCase();
  if (hasHexPrefix(address)) {
    lowerCaseAddress = lowerCaseAddress.slice(2);
  }

  const addressBytes = new Uint8Array(utils.hex.toBytes(lowerCaseAddress));
  return toChecksumBytesAddress(addressBytes);
}
