import type { Argon2Config } from "./argon2";
import { PrivKey, PubKey } from "@hicaru/ntrup.js";
import {
  NTRU_CONFIG,
  ntruDecrypt,
  ntruEncrypt,
  ntruKeysFromSeed,
} from "./ntrup";
import { sha256 } from "./sha256";
import { EXTENSION_ID } from "../lib/runtime";
import { deriveArgon2Key } from "./argon2";
import {
  kuznechikDecrypt,
  kuznechikEncrypt,
  KUZNECHIK_KEY_SIZE,
} from "./kuznechik";
import { AESCipherV3, AESCipherV2 } from "./aes256";
import { pbkdf2 } from "./pbkdf2";
import { ShaAlgorithms } from "../config/pbkdf2";
import { uint8ArrayToHex } from "lib/utils/hex";
import { utf8ToUint8Array } from "lib/utils/utf8";

export const PUBLICKEYS_BYTES = NTRU_CONFIG.PUBLICKEYS_BYTES;
export const SECRETKEYS_BYTES = NTRU_CONFIG.SECRETKEYS_BYTES;
export const AES_GCM_KEY_SIZE = KUZNECHIK_KEY_SIZE;
export const KEYCHAIN_BYTES_SIZE =
  PUBLICKEYS_BYTES + SECRETKEYS_BYTES + AES_GCM_KEY_SIZE + KUZNECHIK_KEY_SIZE;

export async function deriveKeyFromSeed(
  seed: Uint8Array,
  idx: number,
): Promise<Uint8Array> {
  const hasher = new Uint8Array([...seed, idx]);
  return sha256(hasher);
}

export enum CipherOrders {
  AESCBC,
  AESGCM256,
  KUZNECHIK,
  NTRUP761,
}

export class KeyChain {
  public readonly ntrupKeys: { pk: PubKey; sk: PrivKey };
  public readonly aesKey: Uint8Array;
  public readonly kuznechikKey: Uint8Array;

  constructor(
    ntrupKeys: { pk: PubKey; sk: PrivKey },
    aesKey: Uint8Array,
    kuznechikKey: Uint8Array,
  ) {
    this.ntrupKeys = ntrupKeys;
    this.aesKey = aesKey;
    this.kuznechikKey = kuznechikKey;
  }

  static async fromSeed(seed: Uint8Array): Promise<KeyChain> {
    const ntrupKeys = ntruKeysFromSeed(seed);
    const aesKey = await deriveKeyFromSeed(seed, 0);
    const kuznechikKey = await deriveKeyFromSeed(seed, 1);

    return new KeyChain(ntrupKeys, aesKey, kuznechikKey);
  }

  static async fromAesV2(password: Uint8Array): Promise<KeyChain> {
    const keyHashBytes = await sha256(password);

    const keyHashHex = uint8ArrayToHex(keyHashBytes);
    const aesKeyForV2 = utf8ToUint8Array(keyHashHex);

    const ntrupKeys = ntruKeysFromSeed(
      Uint8Array.from([...keyHashBytes, ...keyHashBytes]),
    );

    return new KeyChain(ntrupKeys, aesKeyForV2, keyHashBytes);
  }

  static async fromAesV3(
    password: Uint8Array,
    algorithm: ShaAlgorithms,
    iteractions: number,
  ): Promise<KeyChain> {
    const salt = utf8ToUint8Array(EXTENSION_ID) as BufferSource;
    const key = await pbkdf2(password, salt, iteractions, algorithm);
    const keyBytes = await sha256(key);
    const ntrupKeys = ntruKeysFromSeed(
      Uint8Array.from([...keyBytes, ...keyBytes]),
    );

    return new KeyChain(ntrupKeys, keyBytes, keyBytes);
  }

  static async fromPass(
    password: Uint8Array,
    fingerprint: Uint8Array,
    argonConfig: Argon2Config,
  ): Promise<KeyChain> {
    const seed = deriveArgon2Key(password, fingerprint, argonConfig);
    return KeyChain.fromSeed(seed);
  }

  static async fromBytes(bytes: Uint8Array): Promise<KeyChain> {
    if (bytes.length !== KEYCHAIN_BYTES_SIZE) {
      throw new Error("Invalid byte length");
    }
    const pkBytes = bytes.slice(0, PUBLICKEYS_BYTES);
    const skBytes = bytes.slice(
      PUBLICKEYS_BYTES,
      PUBLICKEYS_BYTES + SECRETKEYS_BYTES,
    );
    const aesKey = bytes.slice(
      PUBLICKEYS_BYTES + SECRETKEYS_BYTES,
      PUBLICKEYS_BYTES + SECRETKEYS_BYTES + AES_GCM_KEY_SIZE,
    );
    const kuznechikKey = bytes.slice(
      PUBLICKEYS_BYTES + SECRETKEYS_BYTES + AES_GCM_KEY_SIZE,
      KEYCHAIN_BYTES_SIZE,
    );

    const pk = PubKey.import(pkBytes, NTRU_CONFIG);
    const sk = PrivKey.import(skBytes, NTRU_CONFIG);

    return new KeyChain({ pk, sk }, aesKey, kuznechikKey);
  }

  toBytes(): Uint8Array {
    const pkBytes = this.ntrupKeys.pk.toBytes(NTRU_CONFIG);
    const skBytes = this.ntrupKeys.sk.toBytes(NTRU_CONFIG);
    const aesKey = this.aesKey;
    const kuznechikKey = this.kuznechikKey;

    const res = new Uint8Array(KEYCHAIN_BYTES_SIZE);
    res.set(pkBytes, 0);
    res.set(skBytes, PUBLICKEYS_BYTES);
    res.set(aesKey, PUBLICKEYS_BYTES + SECRETKEYS_BYTES);
    res.set(
      kuznechikKey,
      PUBLICKEYS_BYTES + SECRETKEYS_BYTES + AES_GCM_KEY_SIZE,
    );
    return res;
  }

  async encrypt(
    plaintext: Uint8Array,
    options: CipherOrders[],
  ): Promise<Uint8Array> {
    let data = plaintext;
    for (const o of options) {
      switch (o) {
        case CipherOrders.AESCBC:
          throw new Error("OLD method, AESCBC");
        case CipherOrders.AESGCM256:
          data = AESCipherV3.encrypt(data, this.aesKey);
          break;
        case CipherOrders.KUZNECHIK:
          data = kuznechikEncrypt(this.kuznechikKey, data);
          break;
        case CipherOrders.NTRUP761:
          data = ntruEncrypt(this.ntrupKeys.pk, data);
          break;
      }
    }
    return data;
  }

  async decrypt(
    ciphertext: Uint8Array,
    options: CipherOrders[],
  ): Promise<Uint8Array> {
    let data = ciphertext;
    for (const o of options.slice().reverse()) {
      switch (o) {
        case CipherOrders.AESCBC:
          const decryptedString = await AESCipherV2.decrypt(data, this.aesKey);
          data = new TextEncoder().encode(decryptedString);
          break;
        case CipherOrders.AESGCM256:
          data = AESCipherV3.decrypt(data, this.aesKey);
          break;
        case CipherOrders.KUZNECHIK:
          data = kuznechikDecrypt(this.kuznechikKey, data);
          break;
        case CipherOrders.NTRUP761:
          data = ntruDecrypt(this.ntrupKeys.sk, data);
          break;
      }
    }
    return data;
  }

  async makeProof(
    seed: Uint8Array,
    options: CipherOrders[],
  ): Promise<Uint8Array> {
    return this.encrypt(seed, options);
  }

  async getProof(
    cipherProof: Uint8Array,
    options: CipherOrders[],
  ): Promise<Uint8Array> {
    return this.decrypt(cipherProof, options);
  }
}
