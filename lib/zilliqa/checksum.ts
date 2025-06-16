import { sha256 } from 'crypto/sha256';
import { 
    HEX_PREFIX, 
    stripHexPrefix, 
    uint8ArrayToHex, 
    hexToUint8Array, 
    hexToBigInt 
} from 'lib/utils/hex';

export async function toChecksumBytesAddress(addressBytes: Uint8Array): Promise<string> {
  const addressHex = uint8ArrayToHex(addressBytes);
  const hashBytes = await sha256(addressBytes);
  const hashBigInt = hexToBigInt(uint8ArrayToHex(hashBytes));

  let checksummedHex = '';

  for (let i = 0; i < addressHex.length; i++) {
    const char = addressHex[i];
    if (/[0-9]/.test(char)) {
        checksummedHex += char;
    } else {
      const bitPosition = BigInt(255 - 6 * i);
      const mask = BigInt(2) ** bitPosition;
      const shouldBeUpper = (hashBigInt & mask) >= BigInt(1);

      if (shouldBeUpper) {
        checksummedHex += char.toUpperCase();
      } else {
        checksummedHex += char.toLowerCase();
      }
    }
  }

  return HEX_PREFIX + checksummedHex;
}

export async function toChecksumHexAddress(address: string): Promise<string> {
  const unprefixedAddress = stripHexPrefix(address);
  const addressBytes = hexToUint8Array(unprefixedAddress);
  return toChecksumBytesAddress(addressBytes);
}

