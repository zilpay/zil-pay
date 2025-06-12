import * as secp256k1 from "noble-secp256k1";
import {
  bigIntToUint8ArrayBigEndian,
  uint8ArrayToBigIntBigEndian,
} from "./number";
import { ShaAlgorithms } from "../config/pbkdf2";
import { ETHEREUM, ZILLIQA } from "../config/slip44";

// Constants
const HARDENED_BIT = 0x80000000;
const BITCOIN_SEED = new TextEncoder().encode("Bitcoin seed");

// Error enum
export enum Bip32ErrorCode {
  InvalidChild = "InvalidChild",
  InvalidPath = "InvalidPath",
  InvalidSlip44 = "invalid slip44",
  InvalidKey = "InvalidKey",
  HmacError = "HmacError",
}

// Error class
export class Bip32Error extends Error {
  constructor(code: Bip32ErrorCode, message: string) {
    super(message);
    this.name = `Bip32Error:${code}`;
  }
}

/**
 * Represents a child number in a BIP-32 derivation path.
 */
export class ChildNumber {
  constructor(public value: number) {}

  /**
   * Checks if the child number is hardened.
   * @returns {boolean} True if hardened, false otherwise.
   */
  isHardened(): boolean {
    return this.value < 0;
  }

  /**
   * Converts the child number to a 4-byte Uint8Array.
   * @returns {Uint8Array} The byte representation.
   */
  toBytes(): Uint8Array {
    const buffer = new Uint8Array(4);
    buffer[0] = (this.value >>> 24) & 0xff;
    buffer[1] = (this.value >>> 16) & 0xff;
    buffer[2] = (this.value >>> 8) & 0xff;
    buffer[3] = this.value & 0xff;
    return buffer;
  }

  /**
   * Creates a ChildNumber from a string representation.
   * @param {string} s - The string representation (e.g., "0'", "1").
   * @returns {ChildNumber} The parsed ChildNumber.
   * @throws {Bip32Error} If the string is invalid.
   */
  static fromString(s: string): ChildNumber {
    let numStr = s;
    let hardened = false;
    if (s.endsWith("'")) {
      numStr = s.slice(0, -1);
      hardened = true;
    }
    const index = parseInt(numStr, 10);
    if (isNaN(index) || index < 0) {
      throw new Bip32Error(
        Bip32ErrorCode.InvalidChild,
        `Failed to parse child number: ${s}`,
      );
    }
    const value = hardened ? index | HARDENED_BIT : index;
    return new ChildNumber(value);
  }
}

/**
 * Computes an HMAC-SHA512 hash of the data using the provided key.
 * @param {Uint8Array} key - The HMAC key.
 * @param {Uint8Array} data - The data to hash.
 * @returns {Promise<Uint8Array>} The HMAC result.
 * @throws {Bip32Error} If HMAC computation fails.
 */
async function hmacSha512(
  key: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  try {
    const importedKey = await globalThis.crypto.subtle.importKey(
      "raw",
      key,
      {
        name: "HMAC",
        hash: { name: ShaAlgorithms.Sha512 },
      },
      false,
      ["sign"],
    );

    const signature = await globalThis.crypto.subtle.sign(
      "HMAC",
      importedKey,
      data,
    );

    return new Uint8Array(signature);
  } catch (error) {
    throw new Bip32Error(
      Bip32ErrorCode.HmacError,
      `HMAC computation failed: ${error}`,
    );
  }
}

/**
 * Derives the master private key and chain code from a seed.
 * @param {Uint8Array} seed - The seed bytes.
 * @returns {Promise<{ key: Uint8Array; chainCode: Uint8Array }>} The master key and chain code.
 * @throws {Bip32Error} If the master key is invalid.
 */
export async function deriveMasterKey(
  seed: Uint8Array,
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  const hmacResult = await hmacSha512(BITCOIN_SEED, seed);
  const key = new Uint8Array(hmacResult.slice(0, 32));
  const chainCode = new Uint8Array(hmacResult.slice(32, 64));

  if (!secp256k1.utils.isValidPrivateKey(key)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid master key");
  }

  return { key, chainCode };
}

/**
 * Derives a child private key and chain code from a parent key, chain code, and child number.
 * @param {Uint8Array} parentKey - The parent private key.
 * @param {Uint8Array} chainCode - The parent chain code.
 * @param {ChildNumber} child - The child number.
 * @returns {Promise<{ key: Uint8Array; chainCode: Uint8Array }>} The child key and chain code.
 * @throws {Bip32Error} If the child key is invalid.
 */
export async function deriveChildKey(
  parentKey: Uint8Array,
  chainCode: Uint8Array,
  child: ChildNumber,
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  if (!secp256k1.utils.isValidPrivateKey(parentKey)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid parent key");
  }

  let dataToHash: Uint8Array;

  if (child.isHardened()) {
    dataToHash = new Uint8Array([0, ...parentKey, ...child.toBytes()]);
  } else {
    const publicKey = secp256k1.getPublicKey(parentKey, true);
    dataToHash = new Uint8Array([...publicKey, ...child.toBytes()]);
  }

  const hmacResult = await hmacSha512(chainCode, dataToHash);
  const childKeyPart = new Uint8Array(hmacResult.slice(0, 32));
  const newChainCode = new Uint8Array(hmacResult.slice(32, 64));

  const curveOrder = BigInt(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
  );

  let parentScalar = uint8ArrayToBigIntBigEndian(parentKey);
  let childScalar = uint8ArrayToBigIntBigEndian(childKeyPart);

  // Ensure childScalar is within the curve order
  childScalar = childScalar % curveOrder;

  // Add scalars and reduce modulo curve order
  let sum = (parentScalar + childScalar) % curveOrder;

  // Handle the case where sum is 0 (invalid private key)
  if (sum === 0n) {
    throw new Bip32Error(
      Bip32ErrorCode.InvalidKey,
      "Invalid child key: sum is zero",
    );
  }

  const resultKey = bigIntToUint8ArrayBigEndian(sum, 32);

  if (!secp256k1.utils.isValidPrivateKey(resultKey)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid child key");
  }

  return { key: resultKey, chainCode: newChainCode };
}

/**
 * Derives a private key from a seed and a BIP-32 derivation path.
 * @param {Uint8Array} seed - The seed bytes.
 * @param {string} path - The BIP-32 derivation path (e.g., "m/44'/60'/0'/0/0").
 * @returns {Promise<Uint8Array>} The derived private key.
 * @throws {Bip32Error} If the path is invalid or derivation fails.
 */
export async function derivePrivateKey(
  seed: Uint8Array,
  path: string,
): Promise<Uint8Array> {
  if (!path.startsWith("m/")) {
    throw new Bip32Error(
      Bip32ErrorCode.InvalidPath,
      "Path must start with 'm/'",
    );
  }

  const pathParts = path
    .slice(2)
    .split("/")
    .filter((part) => part !== "");

  let { key, chainCode } = await deriveMasterKey(seed);

  for (const part of pathParts) {
    const childNumber = ChildNumber.fromString(part);
    const result = await deriveChildKey(key, chainCode, childNumber);
    key = result.key;
    chainCode = result.chainCode;
  }

  return key;
}

export async function deriveFromPrivateKeyPublicKey(
  privateKey: Uint8Array,
  slip44: number,
  compressed = true,
): Promise<Uint8Array> {
  if (slip44 == ZILLIQA || slip44 == ETHEREUM) {
    return secp256k1.getPublicKey(privateKey, compressed);
  }

  throw new Error(Bip32ErrorCode.InvalidSlip44);
}
