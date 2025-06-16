import { assert } from 'lib/runtime/assert';
import { CHARSET, HRP, GENERATOR } from 'lib/zilliqa/config';
import { toChecksumHexAddress } from 'lib/zilliqa/checksum';
import { hexToUint8Array, uint8ArrayToHex } from '../utils/hex';

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

function verifyChecksum(hrp: string, data: Uint8Array): boolean {
    return polymod(new Uint8Array([...hrpExpand(hrp), ...data])) === 1;
}

function createChecksum(hrp: string, data: Uint8Array): Uint8Array {
    const values: Uint8Array = new Uint8Array([...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]);
    const mod: number = polymod(values) ^ 1;
    const ret: number[] = [];
    for (let p: number = 0; p < 6; ++p) {
        ret.push((mod >> (5 * (5 - p))) & 31);
    }
    return new Uint8Array(ret);
}

export const encode = (hrp: string, data: Uint8Array): string => {
    const checksum: Uint8Array = createChecksum(hrp, data);
    const combined: Uint8Array = new Uint8Array([...data, ...checksum]);
    let ret: string = hrp + '1';
    for (const value of combined) {
        ret += CHARSET.charAt(value);
    }
    return ret;
};

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

export const toBech32Address = async (address: string): Promise<string> => {
    const addressBytes = hexToUint8Array(address);
    const addrBz = convertBits(addressBytes, 8, 5);
    assert(addrBz !== null, 'Cannot convert bytes to Bech32 bits.');

    return encode(HRP, addrBz as Uint8Array);
};

export const fromBech32Address = async (address: string): Promise<string> => {
    const res = decode(address);
    assert(res !== null, 'Invalid Bech32 address.');

    const { hrp, data } = res as { hrp: string; data: Uint8Array };
    assert(hrp === HRP, `Expected HRP '${HRP}', but got '${hrp}'.`);

    const buf = convertBits(data, 5, 8, false);
    assert(buf !== null, 'Cannot convert Bech32 bits to bytes.');

    const hexAddress = uint8ArrayToHex(buf as Uint8Array);

    return toChecksumHexAddress(hexAddress);
};

