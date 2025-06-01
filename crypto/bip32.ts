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
    // Import the key for HMAC. The key should be treated as 'raw' bytes.
    const importedKey = await globalThis.crypto.subtle.importKey(
      "raw", // format of the key
      key, // the key material
      {
        name: "HMAC",
        hash: { name: ShaAlgorithms.Sha512 }, // algorithm for HMAC
      },
      false, // whether the key is extractable (i.e. can be used in exportKey)
      ["sign"], // what the key can be used for
    );

    // Sign the data using the imported HMAC key.
    const signature = await globalThis.crypto.subtle.sign(
      "HMAC", // algorithm identifier
      importedKey, // key to use
      data, // data to sign
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
 * @param seed - The seed bytes (typically 16-64 bytes).
 * @returns An object containing the master private key and chain code.
 * @throws Bip32Error if the key is invalid or HMAC fails.
 */
async function deriveMasterKey(
  seed: Uint8Array,
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  // Derive the master key using HMAC-SHA512 with "Bitcoin seed" as the key.
  const hmacResult = await hmacSha512(BITCOIN_SEED, seed);
  // The first 32 bytes are the master private key, the next 32 bytes are the chain code.
  // Явно создаем новые Uint8Array из срезов, чтобы избежать возможных проблем с ссылками.
  const key = new Uint8Array(hmacResult.slice(0, 32));
  const chainCode = new Uint8Array(hmacResult.slice(32, 64));

  // Validate that the derived key is a valid secp256k1 private key.
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
  let dataToHash: Uint8Array;

  // Determine the data to be hashed based on whether the child is hardened.
  if (child.isHardened()) {
    // For hardened children, the data is 0x00 followed by the parent private key.
    dataToHash = new Uint8Array([0, ...parentKey, ...child.toBytes()]);
  } else {
    // For non-hardened children, the data is the compressed public key of the parent.
    // The public key is derived from the parent private key.
    const publicKey = secp256k1.getPublicKey(parentKey, true); // true for compressed public key (33 bytes)
    dataToHash = new Uint8Array([...publicKey, ...child.toBytes()]);
  }

  // Compute HMAC-SHA512 using the chain code as the key and the prepared data.
  const hmacResult = await hmacSha512(chainCode, dataToHash);
  // The first 32 bytes are the child key part, the next 32 bytes are the new chain code.
  // Явно создаем новые Uint8Array из срезов, чтобы избежать возможных проблем с ссылками.
  const childKeyPart = new Uint8Array(hmacResult.slice(0, 32));
  const newChainCode = new Uint8Array(hmacResult.slice(32, 64));

  // Convert both parent private key and child key part to BigInt for scalar addition.
  const parentScalar = uint8ArrayToBigIntBigEndian(parentKey);
  const childScalar = uint8ArrayToBigIntBigEndian(childKeyPart);

  // The curve order 'n' for secp256k1.
  const curveOrder = BigInt(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
  );

  // Add the parent scalar and child scalar modulo the curve order.
  const sum = (parentScalar + childScalar) % curveOrder;
  // Convert the resulting BigInt back to a 32-byte Uint8Array.
  const resultKey = bigIntToUint8ArrayBigEndian(sum, 32);

  // Validate that the derived child key is a valid secp256k1 private key.
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
  // Validate that the derivation path starts with "m/".
  if (!path.startsWith("m/")) {
    throw new Bip32Error(
      Bip32ErrorCode.InvalidPath,
      "Path must start with 'm/'",
    );
  }

  // Split the path into parts and filter out any empty strings (e.g., from trailing slashes).
  const pathParts = path
    .slice(2) // Remove "m/" prefix
    .split("/")
    .filter((part) => part !== "");

  // Derive the initial master key and chain code from the seed.
  let { key, chainCode } = await deriveMasterKey(seed);

  // Iterate through each part of the derivation path to derive child keys.
  for (const part of pathParts) {
    // Parse the child number from the path part (e.g., "44'" or "0").
    const childNumber = ChildNumber.fromString(part);
    // Derive the child key and its new chain code.
    const result = await deriveChildKey(key, chainCode, childNumber);
    // Update the current key and chain code for the next iteration.
    key = result.key;
    chainCode = result.chainCode;
  }

  // Return the final derived private key.
  return key;
}


