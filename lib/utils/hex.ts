import { TypeOf } from "lib/types";


export const HEX_PREFIX = "0x";

export function hasHexPrefix(str: string): boolean {
  return str.toLowerCase().startsWith(HEX_PREFIX);
}

export function stripHexPrefix(hex: string): string {
  return hasHexPrefix(hex) ? hex.slice(2) : hex;
}

const HEX_CHAR_TABLE: string[] = Array.from({ length: 256 }, (_, i) =>
    i.toString(16).padStart(2, '0')
);

export function uint8ArrayToHex(uint8Array: Uint8Array, prefix: boolean = false): string {
    const hexParts = new Array(uint8Array.length);
    for (let i = 0; i < uint8Array.length; i++) {
        hexParts[i] = HEX_CHAR_TABLE[uint8Array[i]];
    }
    const hexString = hexParts.join('');

    return prefix ? HEX_PREFIX + hexString : hexString;
}

export function hexToUint8Array(hexString: string): Uint8Array {
    if (hexString == '' || hexString == HEX_PREFIX) {
        return new Uint8Array();
    }

    const str = stripHexPrefix(hexString);

    if (str.length % 2 !== 0) {
        throw new Error('Invalid hex string: must have an even number of characters.');
    }

    const arrayBuffer = new Uint8Array(str.length / 2);

    for (let i = 0; i < str.length; i += 2) {
        const byteString = str.substring(i, i + 2);
        const byteValue = parseInt(byteString, 16);

        if (isNaN(byteValue)) {
            throw new Error(`Invalid hex character "${byteString}" at position ${i}.`);
        }
        
        arrayBuffer[i / 2] = byteValue;
    }

    return Uint8Array.from(arrayBuffer);
}


export function hexToBigInt(hexString: string): bigint {
    if (hexString == HEX_PREFIX) {
      return 0n;
    }

    const cleanHex = hexString.startsWith(HEX_PREFIX) ? hexString : `${HEX_PREFIX}${hexString}`;
    return BigInt(cleanHex);
}

export function bigintToHex(value: bigint, prefix = true): string {
    return (prefix ? HEX_PREFIX : '') + value.toString(16);
}


export function convertBigIntsToHex(obj: { [key: string]: unknown }): { [key: string]: unknown } {
  const newObj: { [key: string]: unknown } = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (TypeOf.isBigInt(value)) {
        newObj[key] = HEX_PREFIX + (value as bigint).toString(16);
      } else {
        newObj[key] = value;
      }
    }
  }

  return newObj;
}
