export function stripHexPrefix(hex: string): string {
  return hex.toLowerCase().startsWith('0x') ? hex.slice(2) : hex;
}

/**
 * A lookup table for fast number-to-hex conversion.
 */
const HEX_CHAR_TABLE: string[] = Array.from({ length: 256 }, (_, i) =>
    i.toString(16).padStart(2, '0')
);

/**
 * Efficiently converts a Uint8Array to a hexadecimal string.
 * This function uses a pre-computed lookup table for maximum performance.
 *
 * @param {Uint8Array} uint8Array The byte array (numbers 0-255) to convert.
 * @param {boolean} [prefix=false] Whether to include the '0x' prefix in the output.
 * @returns {string} The resulting hexadecimal string.
 */
export function uint8ArrayToHex(uint8Array: Uint8Array, prefix: boolean = false): string {
    const hexParts = new Array(uint8Array.length);
    for (let i = 0; i < uint8Array.length; i++) {
        hexParts[i] = HEX_CHAR_TABLE[uint8Array[i]];
    }
    const hexString = hexParts.join('');

    return prefix ? '0x' + hexString : hexString;
}

/**
 * Efficiently converts a hexadecimal string to a Uint8Array.
 * This function is optimized to minimize memory allocation and avoid
 * unnecessary intermediate conversions.
 *
 * @param {string} hexString The hexadecimal string (may start with '0x').
 * @returns {Uint8Array} A Uint8Array representing the hexadecimal data.
 * @throws {Error} if the string has an odd number of characters or contains invalid hex characters.
 */
export function hexToUint8Array(hexString: string): Uint8Array {
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

