import { sha256 } from 'crypto/sha256';
import { utils } from 'aes-js';

/**
 * Checks if a string starts with the '0x' prefix (case-insensitive).
 *
 * @param str The string to check.
 * @returns True if the string starts with '0x', false otherwise.
 */
function hasHexPrefix(str: string): boolean {
  return str.toLowerCase().startsWith('0x');
}

export async function toChecksumAddress(address: string): Promise<string> {
  let lowerCaseAddress = address.toLowerCase();
  if (hasHexPrefix(address)) {
    lowerCaseAddress = lowerCaseAddress.slice(2);
  }

  const addressBytes = new Uint8Array(utils.hex.toBytes(lowerCaseAddress));
  const hashBytes = await sha256(addressBytes);
  const hashBigInt = BigInt(`0x${utils.hex.fromBytes(hashBytes)}`);
  let checksumAddress = '0x';

  for (let i = 0; i < lowerCaseAddress.length; i++) {
    const char = lowerCaseAddress[i];
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
