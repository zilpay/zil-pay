import { assert } from 'lib/runtime/assert';
import { CHARSET, HRP, GENERATOR } from 'lib/zilliqa/config';
import { toChecksumHexAddress } from 'lib/zilliqa/checksum';
import { utils } from 'aes-js';
import { TypeOf } from 'lib/types';


/**
 * Calculates the polynomial modulo for Bech32 checksum calculation.
 *
 * @param values The Uint8Array of input values.
 * @returns The polynomial modulo result.
 */
const polymod = (values: Uint8Array): number => {
    let chk: number = 1;
    for (let p: number = 0; p < values.length; ++p) {
        const top: number = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ values[p];
        for (let i: number = 0; i < 5; ++i) {
            if ((top >> i) & 1) {
                chk ^= GENERATOR[i];
            }
        }
    }
    return chk;
};

/**
 * Expands the Human-Readable Part (HRP) into a Uint8Array for checksum calculation.
 *
 * @param hrp The Human-Readable Part string.
 * @returns The Uint8Array representation of the expanded HRP.
 */
const hrpExpand = (hrp: string): Uint8Array => {
    const ret: number[] = [];
    for (let i: number = 0; i < hrp.length; ++i) {
        ret.push(hrp.charCodeAt(i) >> 5);
    }
    ret.push(0);
    for (let i: number = 0; i < hrp.length; ++i) {
        ret.push(hrp.charCodeAt(i) & 31);
    }
    return new Uint8Array(ret);
};

/**
 * Converts an array of numbers of `fromWidth` bits to an array of numbers of `toWidth` bits.
 *
 * @param data The input array of numbers.
 * @param fromWidth The number of bits per input number.
 * @param toWidth The number of bits per output number.
 * @param pad Whether to pad the output if the input is not a multiple of `fromWidth`.
 * @returns A new Uint8Array containing the converted bits, or null if input is invalid.
 */
export function convertBits(data: Uint8Array, fromWidth: number, toWidth: number, pad: boolean = true): Uint8Array | null {
    let acc: number = 0;
    let bits: number = 0;
    const ret: number[] = [];
    const maxv: number = (1 << toWidth) - 1;

    for (const value of data) {
        if (value < 0 || (value >> fromWidth) !== 0) {
            return null;
        }
        acc = (acc << fromWidth) | value;
        bits += fromWidth;
        while (bits >= toWidth) {
            bits -= toWidth;
            ret.push((acc >> bits) & maxv);
        }
    }

    if (pad) {
        if (bits > 0) {
            ret.push((acc << (toWidth - bits)) & maxv);
        }
    } else if (bits >= fromWidth || (acc << (toWidth - bits)) & maxv) {
        return null;
    }

    return new Uint8Array(ret);
}

/**
 * Verifies the checksum of a Bech32 encoded string.
 *
 * @param hrp The Human-Readable Part of the Bech32 string.
 * @param data The Uint8Array of the data part of the Bech32 string.
 * @returns True if the checksum is valid, false otherwise.
 */
function verifyChecksum(hrp: string, data: Uint8Array): boolean {
    return polymod(new Uint8Array([...hrpExpand(hrp), ...data])) === 1;
}

/**
 * Creates the checksum for a given HRP and data.
 *
 * @param hrp The Human-Readable Part string.
 * @param data The Uint8Array of the data to be checksummed.
 * @returns A Uint8Array representing the checksum.
 */
function createChecksum(hrp: string, data: Uint8Array): Uint8Array {
    const values: Uint8Array = new Uint8Array([...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]);
    const mod: number = polymod(values) ^ 1;
    const ret: number[] = [];
    for (let p: number = 0; p < 6; ++p) {
        ret.push((mod >> (5 * (5 - p))) & 31);
    }
    return new Uint8Array(ret);
}

/**
 * Encodes data with a Human-Readable Part (HRP) into a Bech32 string.
 *
 * @param hrp The Human-Readable Part string.
 * @param data The Uint8Array of data to encode.
 * @returns The Bech32 encoded string.
 */
export const encode = (hrp: string, data: Uint8Array): string => {
    const checksum: Uint8Array = createChecksum(hrp, data);
    const combined: Uint8Array = new Uint8Array([...data, ...checksum]);
    let ret: string = hrp + '1';
    for (const value of combined) {
        ret += CHARSET.charAt(value);
    }
    return ret;
};

/**
 * Decodes a Bech32 encoded string into its Human-Readable Part (HRP) and data.
 *
 * @param bechString The Bech32 encoded string to decode.
 * @returns An object containing the HRP and the Uint8Array of data, or null if decoding fails.
 */
export const decode = (bechString: string): { hrp: string; data: Uint8Array } | null => {
    let hasLower: boolean = false;
    let hasUpper: boolean = false;
    for (let i: number = 0; i < bechString.length; ++i) {
        const charCode: number = bechString.charCodeAt(i);
        if (charCode < 33 || charCode > 126) {
            return null;
        }
        if (charCode >= 97 && charCode <= 122) {
            hasLower = true;
        }
        if (charCode >= 65 && charCode <= 90) {
            hasUpper = true;
        }
    }

    if (hasLower && hasUpper) {
        return null;
    }

    const lowerBechString: string = bechString.toLowerCase();
    const pos: number = lowerBechString.lastIndexOf('1');

    if (pos < 1 || pos + 7 > lowerBechString.length || lowerBechString.length > 90) {
        return null;
    }

    const hrp: string = lowerBechString.substring(0, pos);
    const data: number[] = [];
    for (let i: number = pos + 1; i < lowerBechString.length; ++i) {
        const d: number = CHARSET.indexOf(lowerBechString.charAt(i));
        if (d === -1) {
            return null;
        }
        data.push(d);
    }

    const dataBytes: Uint8Array = new Uint8Array(data);
    if (!verifyChecksum(hrp, dataBytes)) {
        return null;
    }

    return { hrp, data: dataBytes.slice(0, dataBytes.length - 6) };
};

/**
 * Checks if a string starts with the '0x' prefix (case-insensitive).
 *
 * @param str The string to check.
 * @returns True if the string starts with '0x', false otherwise.
 */
function hasHexPrefix(str: string): boolean {
    return str.toLowerCase().startsWith('0x');
}

/**
 * Validates if a string is a valid hexadecimal Zilliqa address.
 *
 * @param address The string to validate.
 * @returns True if the string is a valid hexadecimal address, false otherwise.
 */
function isValidHexAddress(address: string): boolean {
    return !address || !TypeOf.isString(address) || (!hasHexPrefix(address) ? address.length !== 40 : address.length !== 42) || !/^[0-9a-fA-F]+$/.test(hasHexPrefix(address) ? address.slice(2) : address);
}

/**
 * Converts a hexadecimal address to a Bech32 encoded Zilliqa address.
 *
 * @param address The hexadecimal address string (with or without '0x' prefix).
 * @returns The Bech32 encoded Zilliqa address.
 * @throws {Error} If the provided address is invalid or conversion fails.
 */
export const toBech32Address = async (address: string): Promise<string> => {
    assert(!isValidHexAddress(address), 'Invalid address provided.');

    const hexString: string = hasHexPrefix(address) ? address.slice(2) : address;
    const addressBytes: Uint8Array | null = utils.hex.toBytes(hexString);
    assert(addressBytes !== null, 'Cannot convert hex string to bytes.');

    const addrBz: Uint8Array | null = convertBits(addressBytes, 8, 5);
    assert(addrBz !== null, 'Cannot convert bytes to Bech32 bits.');

    return encode(HRP, addrBz!);
};

/**
 * Converts a Bech32 encoded Zilliqa address to a checksummed hexadecimal address.
 *
 * @param address The Bech32 encoded Zilliqa address.
 * @returns The checksummed hexadecimal address string with the '0x' prefix.
 * @throws {Error} If the provided Bech32 address is invalid or conversion fails.
 */
export const fromBech32Address = async (address: string): Promise<string> => {
    const res = decode(address);
    assert(res !== null, 'Invalid Bech32 address.');

    // Explicitly assert the type of 'res' after the null check
    const { hrp, data } = res as { hrp: string; data: Uint8Array };
    assert(hrp === HRP, `Expected HRP '${HRP}', but got '${hrp}'.`);

    const buf: Uint8Array | null = convertBits(data, 5, 8, false);
    assert(buf !== null, 'Cannot convert Bech32 bits to bytes.');

    const hexAddress: string = Array.from(buf!)
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');

    return toChecksumHexAddress(`0x${hexAddress}`);
};
