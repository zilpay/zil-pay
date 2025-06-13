import { getPublicKey } from '@noble/secp256k1';
import { utils } from '@noble/secp256k1';
import {
  bigIntToUint8ArrayBigEndian,
  uint8ArrayToBigIntBigEndian,
} from "./number";
import { ShaAlgorithms } from "../config/pbkdf2";
import { ETHEREUM, ZILLIQA } from "../config/slip44";

const HARDENED_BIT = 0x80000000;
const BITCOIN_SEED = new TextEncoder().encode("Bitcoin seed");

export enum Bip32ErrorCode {
  InvalidChild = "InvalidChild",
  InvalidPath = "InvalidPath",
  InvalidSlip44 = "invalid slip44",
  InvalidKey = "InvalidKey",
  HmacError = "HmacError",
}

export class Bip32Error extends Error {
  constructor(code: Bip32ErrorCode, message: string) {
    super(message);
    this.name = `Bip32Error:${code}`;
  }
}

export class ChildNumber {
  constructor(public value: number) {}

  isHardened(): boolean {
    return this.value < 0;
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
    const value = hardened ? index | HARDENED_BIT : index;
    return new ChildNumber(value);
  }
}

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

export async function deriveMasterKey(
  seed: Uint8Array,
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  const hmacResult = await hmacSha512(BITCOIN_SEED, seed);
  const key = new Uint8Array(hmacResult.slice(0, 32));
  const chainCode = new Uint8Array(hmacResult.slice(32, 64));

  if (!utils.isValidPrivateKey(key)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid master key");
  }

  return { key, chainCode };
}

export async function deriveChildKey(
  parentKey: Uint8Array,
  chainCode: Uint8Array,
  child: ChildNumber,
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  if (!utils.isValidPrivateKey(parentKey)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid parent key");
  }

  let dataToHash: Uint8Array;

  if (child.isHardened()) {
    dataToHash = new Uint8Array([0, ...parentKey, ...child.toBytes()]);
  } else {
    const publicKey = getPublicKey(parentKey, true);
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

  childScalar = childScalar % curveOrder;

  let sum = (parentScalar + childScalar) % curveOrder;

  if (sum === 0n) {
    throw new Bip32Error(
      Bip32ErrorCode.InvalidKey,
      "Invalid child key: sum is zero",
    );
  }

  const resultKey = bigIntToUint8ArrayBigEndian(sum, 32);

  if (!utils.isValidPrivateKey(resultKey)) {
    throw new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid child key");
  }

  return { key: resultKey, chainCode: newChainCode };
}

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
    return getPublicKey(privateKey, compressed);
  }

  throw new Error(Bip32ErrorCode.InvalidSlip44);
}

