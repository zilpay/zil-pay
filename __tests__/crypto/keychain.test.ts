import { describe, it, expect } from "vitest";
import {
  KeyChain,
  CipherOrders,
  AES_GCM_KEY_SIZE,
  KEYCHAIN_BYTES_SIZE,
  deriveKeyFromSeed,
} from "../../crypto/keychain";
import { PubKey, PrivKey } from "@hicaru/ntrup.js";
import { Config, Variant, Version } from "@hicaru/argon2-pure.js";
import { APP_ID } from "../../config/argon2";
import { randomBytes } from "../../crypto/random";
import { NTRU_CONFIG } from "../../crypto/ntrup";
import { utils } from "aes-js";
import { PASSWORD, STORAGE_V2, WORDS } from "../data";
import { sha256 } from "../../crypto/sha256";

const LIGHT_ARGON2_CONFIG = new Config(
  APP_ID,
  64,
  1,
  64,
  new Uint8Array([]),
  1,
  Variant.Argon2id,
  Version.Version13,
);

describe("KeyChain", () => {
  it("test derive key from seed and index", async () => {
    const seed = Uint8Array.from([
      42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
      42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
    ]);
    const r1 = await deriveKeyFromSeed(seed, 1);
    const r2 = await deriveKeyFromSeed(seed, 2);

    expect(r1).toEqual(
      Uint8Array.from([
        110, 184, 151, 158, 154, 167, 152, 8, 9, 51, 232, 16, 76, 69, 174, 96,
        19, 234, 70, 139, 138, 205, 60, 15, 254, 119, 216, 112, 88, 218, 122, 9,
      ]),
    );
    expect(r2).toEqual(
      Uint8Array.from([
        64, 210, 75, 227, 185, 9, 209, 199, 53, 232, 57, 9, 149, 24, 239, 67,
        71, 55, 108, 54, 149, 48, 252, 151, 140, 50, 74, 170, 67, 174, 246, 190,
      ]),
    );
  });

  it("should initialize from seed", async () => {
    const seed = randomBytes(32);
    const keychain = await KeyChain.fromSeed(seed);

    expect(keychain).toBeDefined();
    expect(keychain.aesKey).toBeInstanceOf(Uint8Array);
    expect(keychain.aesKey.length).toBe(AES_GCM_KEY_SIZE);
    expect(keychain.ntrupKeys.pk).toBeInstanceOf(PubKey);
    expect(keychain.ntrupKeys.sk).toBeInstanceOf(PrivKey);
    expect(keychain.kuznechikKey).toBeInstanceOf(Uint8Array);
  });

  it("should initialize from password", async () => {
    const password = randomBytes(32);
    const fingerprint = new Uint8Array();

    const keychain = await KeyChain.fromPass(
      password,
      fingerprint,
      LIGHT_ARGON2_CONFIG,
    );

    expect(keychain).toBeDefined();
    expect(keychain.aesKey).toBeInstanceOf(Uint8Array);
    expect(keychain.aesKey.length).toBe(AES_GCM_KEY_SIZE);
    expect(keychain.ntrupKeys.pk).toBeInstanceOf(PubKey);
    expect(keychain.ntrupKeys.sk).toBeInstanceOf(PrivKey);
    expect(keychain.kuznechikKey).toBeInstanceOf(Uint8Array);
  });

  it("should serialize to bytes and deserialize correctly", async () => {
    const seed = randomBytes(32);
    const keychain = await KeyChain.fromSeed(seed);

    const bytes = keychain.toBytes();
    const restoredKeychain = await KeyChain.fromBytes(bytes);

    expect(bytes.length).toBe(KEYCHAIN_BYTES_SIZE);
    expect(restoredKeychain.aesKey).toEqual(keychain.aesKey);
    expect(restoredKeychain.ntrupKeys.pk.toBytes(NTRU_CONFIG)).toEqual(
      keychain.ntrupKeys.pk.toBytes(NTRU_CONFIG),
    );
    expect(restoredKeychain.ntrupKeys.sk.toBytes(NTRU_CONFIG)).toEqual(
      keychain.ntrupKeys.sk.toBytes(NTRU_CONFIG),
    );
    expect(restoredKeychain.kuznechikKey).toEqual(keychain.kuznechikKey);
  });

  it("should encrypt and decrypt correctly", async () => {
    const seed = randomBytes(32);
    const plaintext = randomBytes(1024);
    const keychain = await KeyChain.fromSeed(seed);
    const options = [
      CipherOrders.AESGCM256,
      CipherOrders.NTRUP761,
      CipherOrders.KUZNECHIK,
    ];

    const ciphertext = await keychain.encrypt(plaintext, options);
    const decrypted = await keychain.decrypt(ciphertext, options);

    expect(ciphertext).not.toEqual(plaintext);
    expect(decrypted).toEqual(plaintext);

    const invalidOptions = [CipherOrders.NTRUP761, CipherOrders.AESGCM256];
    await expect(
      keychain.decrypt(ciphertext, invalidOptions),
    ).rejects.toThrow();
  });

  it("should make and verify proof correctly", async () => {
    const seed = randomBytes(32);
    const keychain = await KeyChain.fromSeed(seed);
    const options = [
      CipherOrders.NTRUP761,
      CipherOrders.AESGCM256,
      CipherOrders.KUZNECHIK,
    ];
    const proofSeed = randomBytes(32);

    const proofCipher = await keychain.makeProof(proofSeed, options);
    const retrievedSeed = await keychain.getProof(proofCipher, options);

    expect(proofCipher).not.toEqual(proofSeed);
    expect(retrievedSeed).toEqual(proofSeed);
  });

  it("should decrypt old AESCBC encrypted data correctly", async () => {
    let password = utils.utf8.toBytes(PASSWORD);
    let keyBytes = await sha256(password);
    let key = utils.hex.fromBytes(keyBytes);
    let aesKey = new TextEncoder().encode(key);

    const dummySeed = randomBytes(32);
    const dummyKeychain = await KeyChain.fromSeed(dummySeed);
    const ntrupKeys = dummyKeychain.ntrupKeys;
    const kuznechikKey = dummyKeychain.kuznechikKey;

    const keychain = new KeyChain(ntrupKeys, aesKey, kuznechikKey);

    let vault = STORAGE_V2.vault;
    let ciphertext = new TextEncoder().encode(vault);

    const decrypted = await keychain.decrypt(ciphertext, [CipherOrders.AESCBC]);
    const decryptedStr = new TextDecoder().decode(decrypted);

    expect(decryptedStr).toEqual(WORDS);
  });
});
