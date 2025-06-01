import { pbkdf2 } from "../crypto/pbkdf2";
import * as secp256k1 from "noble-secp256k1";
import {
  bigIntToUint8ArrayBigEndian,
  uint8ArrayToBigIntBigEndian,
} from "./number";
import { ShaAlgorithms } from "../config/pbkdf2";

// Constants
const HARDENED_BIT = 0x80000000;
const BITCOIN_SEED = new TextEncoder().encode("Bitcoin seed");

// Error enum
export enum Bip32ErrorCode {
  InvalidChild = "InvalidChild",
  InvalidPath = "InvalidPath",
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

// ChildNumber class
class ChildNumber {
  constructor(public value: number) {}

  isHardened(): boolean {
    return (this.value & HARDENED_BIT) === HARDENED_BIT;
  }

  toBytes(): Uint8Array {
    const buffer = new Uint8Array(4);
    buffer[0] = (this.value >>> 24) & 0xff;
    buffer[1] = (this.value >>> 16) & 0xff;
    buffer[2] = (this.value >>> 8) & 0xff;
    buffer[3] = this.value & 0xff;
    return buffer;
  }

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
    if (index >= HARDENED_BIT) {
      throw new Bip32Error(
        Bip32ErrorCode.InvalidChild,
        "Child number too large",
      );
    }
    const value = hardened ? index | HARDENED_BIT : index;
    return new ChildNumber(value);
  }
}

/**
 * Computes an HMAC-SHA512 hash of the data using the provided key.
 * @param key - The key for HMAC computation.
 * @param data - The data to hash.
 * @returns A 64-byte Uint8Array containing the HMAC-SHA512 result.
 * @throws Bip32Error if the HMAC computation fails.
 */
async function hmacSha512(
  key: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  try {
    const result = await pbkdf2(data, key, 1, ShaAlgorithms.Sha512);
    return new Uint8Array(result);
  } catch (error) {
    throw new Bip32Error(
      Bip32ErrorCode.HmacError,
      `HMAC computation failed: ${error}`,
    );
  }
}

/**
 * Derives the master private key and chain code from a seed.
 * @param seed - The seed bytes (typically 16-64 bytes).
 * @returns An object containing the master private key and chain code.
 * @throws Bip32Error if the key is invalid or HMAC fails.
 */
async function deriveMasterKey(
  seed: Uint8Array,
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  const hmacResult = await hmacSha512(BITCOIN_SEED, seed);
  const [key, chainCode] = [hmacResult.slice(0, 32), hmacResult.slice(32, 64)];

  if (!secp256k1.utils.isValidPrivateKey(key)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid master key");
  }

  return { key, chainCode };
}

/**
 * Derives a child private key and chain code from a parent key, chain code, and child number.
 * @param parentKey - The parent private key.
 * @param chainCode - The parent chain code.
 * @param child - The child number (hardened or non-hardened).
 * @returns An object containing the child private key and chain code.
 * @throws Bip32Error if the key is invalid or HMAC fails.
 */
async function deriveChildKey(
  parentKey: Uint8Array,
  chainCode: Uint8Array,
  child: ChildNumber,
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  const data = new Uint8Array(
    child.isHardened()
      ? [0, ...parentKey]
      : [...secp256k1.getPublicKey(parentKey, true)],
  );
  data.set(child.toBytes(), data.length);

  const hmacResult = await hmacSha512(chainCode, data);
  const [childKeyPart, newChainCode] = [
    hmacResult.slice(0, 32),
    hmacResult.slice(32, 64),
  ];

  // Add parent key and child key part (modulo curve order)
  const parentScalar = uint8ArrayToBigIntBigEndian(parentKey);
  const childScalar = uint8ArrayToBigIntBigEndian(childKeyPart);
  const curveOrder = BigInt(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
  );
  const sum = (parentScalar + childScalar) % curveOrder;
  const resultKey = bigIntToUint8ArrayBigEndian(sum, 32);

  if (!secp256k1.utils.isValidPrivateKey(resultKey)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid child key");
  }

  return { key: resultKey, chainCode: newChainCode };
}

/**
 * Derives a private key from a seed and a BIP-32 derivation path.
 * @param seed - The seed bytes (typically 16-64 bytes).
 * @param path - The derivation path (e.g., "m/44'/60'/0'/0/0").
 * @returns The derived private key as a Uint8Array.
 * @throws Bip32Error if the path is invalid, key derivation fails, or inputs are invalid.
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
