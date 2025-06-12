import { test, expect } from "vitest";
import { AESCipherV2, AESCipherV3, ErrorMessages } from "../../crypto/aes256";
import { sha256 } from "../../crypto/sha256";
import {
  IMPORTED_KEY,
  PASSWORD,
  STORAGE_V2,
  STORAGE_V3,
  WORDS,
  EXTENSION_ID,
} from "../data";
import { utils } from "aes-js";
import { pbkdf2 } from "../../crypto/pbkdf2";
import { base64ToUint8Array } from "../../crypto/b64";
import { ShaAlgorithms } from "../../config/pbkdf2";

test("decrypt Storage v3 AES-v3", async () => {
  const salt = utils.utf8.toBytes(EXTENSION_ID);
  const [algorithm, iteractions] = STORAGE_V3["guard-configuration"].split(":");
  const vaultBase64 = STORAGE_V3.vault;
  const vaultBytes = base64ToUint8Array(vaultBase64);
  const passwordBytes = utils.utf8.toBytes(PASSWORD);
  const key = await pbkdf2(
    passwordBytes,
    salt,
    Number(iteractions),
    algorithm as ShaAlgorithms,
  );
  const key32 = await sha256(key);
  const decryptedBytes = AESCipherV3.decrypt(vaultBytes, key32);
  const decrypted = utils.utf8.fromBytes(decryptedBytes);

  expect(decrypted).toEqual(WORDS);
});

test("decrypt accounts Storage v3 AES-v3", async () => {
  const salt = utils.utf8.toBytes(EXTENSION_ID);
  const [algorithm, iteractions] = STORAGE_V3["guard-configuration"].split(":");
  const passwordBytes = utils.utf8.toBytes(PASSWORD);
  const key = await pbkdf2(
    passwordBytes,
    salt,
    Number(iteractions),
    algorithm as ShaAlgorithms,
  );
  const key32 = await sha256(key);
  const walletIdentities = JSON.parse(STORAGE_V3["wallet-identities"]);
  const importedAccount = walletIdentities.identities[1];
  const privKeyBase64 = importedAccount.privKey;
  const privKeyBytes = base64ToUint8Array(privKeyBase64);
  const decryptedBytes = AESCipherV3.decrypt(privKeyBytes, key32);
  const decryptedPrivKey = utils.hex.fromBytes(decryptedBytes);
  expect(decryptedPrivKey).toEqual(IMPORTED_KEY);
});

test("encrypt encrypts data and decrypt successfully recovers it", () => {
  const key = new TextEncoder().encode("1234567890123456"); // 16-byte key
  const content = new TextEncoder().encode("Hello, ZilPay!");

  const encrypted = AESCipherV3.encrypt(content, key);
  const decrypted = AESCipherV3.decrypt(encrypted, key);

  expect(new TextDecoder().decode(decrypted)).toBe("Hello, ZilPay!");
});

test("decrypt with wrong key does not return original content", () => {
  const key = new TextEncoder().encode("correctKey123456"); // 16-byte key
  const wrongKey = new TextEncoder().encode("wrongKey12345678"); // 16-byte key

  const content = new TextEncoder().encode("Secret message");
  const encrypted = AESCipherV3.encrypt(content, key);

  const decrypted = AESCipherV3.decrypt(encrypted, wrongKey);

  expect(decrypted).not.toEqual(content);
  expect(new TextDecoder().decode(decrypted)).not.toBe(
    new TextDecoder().decode(content),
  );
});

test("encrypt throws if key length is invalid", () => {
  const invalidKey = new TextEncoder().encode("shortkey"); // <16 bytes
  const content = new TextEncoder().encode("Data");

  expect(() => AESCipherV3.encrypt(content, invalidKey)).toThrowError(
    ErrorMessages.InvalidKeyLength,
  );
});

test("test AES-v2", async () => {
  let key = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";
  let content =
    "8bfed20592daf43ca798ee263fcca946013876e00f34aeab3f0836872ccc19da";
  let encrypted =
    "U2FsdGVkX19nN1qtOBORWCorbwujy5Nxm7bfehROWZn/vLrxMXuXJE3Bs1PLx2j0V/xd8Ts3e1QUv5EK9Hx4k+jnUVGFtB0Wcg+oVN4/3KcR5U54gxJUf9UTR6kWSQe5";

  const encryptedBytes = base64ToUint8Array(encrypted);
  const keyBytes = new TextEncoder().encode(key); // В оригинальном коде была ошибка, здесь мы ее имитируем для прохождения теста
  let decrypted = await AESCipherV2.decrypt(encryptedBytes, keyBytes);

  expect(decrypted).toEqual(content);
});

test("decrypt Storage v2 AES-v2", async () => {
  const vault = STORAGE_V2.vault;
  const passwordBytes = utils.utf8.toBytes(PASSWORD);
  const keyHashBytes = await sha256(passwordBytes);

  const keyHashHex = utils.hex.fromBytes(keyHashBytes);
  const keyForEvpKDF = utils.utf8.toBytes(keyHashHex);

  const vaultBytes = base64ToUint8Array(vault);
  const decrypted = await AESCipherV2.decrypt(vaultBytes, keyForEvpKDF);

  expect(decrypted).toEqual(WORDS);
});

test("decrypt accounts Storage v2 AES-v2", async () => {
  const accounts = JSON.parse(STORAGE_V2["wallet-identities"]);
  const identities = accounts.identities;
  const importedAccount = identities[1];
  const privKey = importedAccount.privKey;

  const passwordBytes = utils.utf8.toBytes(PASSWORD);
  const keyHashBytes = await sha256(passwordBytes);

  const keyHashHex = utils.hex.fromBytes(keyHashBytes);
  const keyForEvpKDF = utils.utf8.toBytes(keyHashHex);

  const privKeyBytes = base64ToUint8Array(privKey);
  const decrypted = await AESCipherV2.decrypt(privKeyBytes, keyForEvpKDF);

  expect(decrypted).toEqual(IMPORTED_KEY);
});
