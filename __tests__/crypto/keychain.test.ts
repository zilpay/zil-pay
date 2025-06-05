import { describe, it, expect } from "vitest";
import {
  KeyChain,
  CipherOrders,
  AES_GCM_KEY_SIZE,
  KEYCHAIN_BYTES_SIZE,
} from "../../crypto/keychain";
import { PubKey, PrivKey } from "@hicaru/ntrup.js";
import { Config, Variant, Version } from "@hicaru/argon2-pure.js";
import { APP_ID } from "../../config/argon2";

const ARGON2_DEFAULT_CONFIG = new Config(
  APP_ID,
  64,
  4,
  65536,
  new Uint8Array([]),
  2,
  Variant.Argon2id,
  Version.Version13,
);

describe("KeyChain", () => {
  // Helper function to generate random bytes
  const generateRandomBytes = (size: number): Uint8Array => {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return bytes;
  };

  /** Test Initialization from Seed */
  it("should initialize from seed", async () => {
    // Arrange
    const seed = generateRandomBytes(32);

    // Act
    const keychain = await KeyChain.fromSeed(seed);

    // Assert
    expect(keychain).toBeDefined();
    expect(keychain.aesKey).toBeInstanceOf(Uint8Array);
    expect(keychain.aesKey.length).toBe(AES_GCM_KEY_SIZE);
    expect(keychain.ntrupKeys.pk).toBeInstanceOf(PubKey);
    expect(keychain.ntrupKeys.sk).toBeInstanceOf(PrivKey);
    expect(keychain.kuznechikKey).toBeInstanceOf(Uint8Array);
  });

  /** Test Initialization from Password */
  it("should initialize from password", async () => {
    // Arrange
    const password = generateRandomBytes(32);
    const fingerprint = "";

    // Act
    const keychain = await KeyChain.fromPass(
      password,
      fingerprint,
      ARGON2_DEFAULT_CONFIG,
    );

    // Assert
    expect(keychain).toBeDefined();
    expect(keychain.aesKey).toBeInstanceOf(Uint8Array);
    expect(keychain.aesKey.length).toBe(AES_GCM_KEY_SIZE);
    expect(keychain.ntrupKeys.pk).toBeInstanceOf(PubKey);
    expect(keychain.ntrupKeys.sk).toBeInstanceOf(PrivKey);
    expect(keychain.kuznechikKey).toBeInstanceOf(Uint8Array);
  });

  /** Test Serialization and Deserialization */
  it("should serialize to bytes and deserialize correctly", async () => {
    const seed = generateRandomBytes(32);
    const keychain = await KeyChain.fromSeed(seed);

    const bytes = keychain.toBytes();
    const restoredKeychain = await KeyChain.fromBytes(bytes);

    expect(bytes.length).toBe(KEYCHAIN_BYTES_SIZE);
    expect(restoredKeychain.aesKey).toEqual(keychain.aesKey);
    // expect(restoredKeychain.ntrupKeys.pk.toBytes()).toEqual(keychain.ntrupKeys.pk.toBytes());
    // expect(restoredKeychain.ntrupKeys.sk.toBytes()).toEqual(keychain.ntrupKeys.sk.toBytes());
    expect(restoredKeychain.kuznechikKey).toEqual(keychain.kuznechikKey);
  });

  it("should encrypt and decrypt correctly", async () => {
    const seed = generateRandomBytes(32);
    const plaintext = generateRandomBytes(1024);
    const keychain = await KeyChain.fromSeed(seed);
    const options = [CipherOrders.AESGCM256, CipherOrders.NTRUP761];

    const ciphertext = await keychain.encrypt(plaintext, options);
    const decrypted = await keychain.decrypt(ciphertext, options);

    expect(ciphertext).not.toEqual(plaintext);
    expect(decrypted).toEqual(plaintext);

    const invalidOptions = [CipherOrders.NTRUP761, CipherOrders.AESGCM256];
    await expect(keychain.decrypt(ciphertext, invalidOptions)).rejects.toThrow(
      /decryption failed/i,
    );
  });

  it("should make and verify proof correctly", async () => {
    const seed = generateRandomBytes(32);
    const keychain = await KeyChain.fromSeed(seed);
    const options = [CipherOrders.NTRUP761, CipherOrders.AESGCM256];
    const proofSeed = generateRandomBytes(32);

    const proofCipher = await keychain.makeProof(proofSeed, options);
    const retrievedSeed = await keychain.getProof(proofCipher, options);

    expect(proofCipher).not.toEqual(proofSeed);
    expect(retrievedSeed).toEqual(proofSeed);
  });
});
