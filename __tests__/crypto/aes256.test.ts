import { test, expect } from "vitest";
import { CipherV2, CipherV3, ErrorMessages } from "../../crypto/aes256";
import { sha256 } from "../../crypto/sha256";
import { IMPORTED_KEY, PASSWORD, STORAGE_V2, WORDS } from "../data";
import { utils } from "aes-js";

test("encrypt encrypts data and decrypt successfully recovers it", () => {
  const key = new TextEncoder().encode("1234567890123456"); // 16-byte key
  const content = new TextEncoder().encode("Hello, ZilPay!");

  const encrypted = CipherV3.encrypt(content, key);
  const decrypted = CipherV3.decrypt(encrypted, key);

  expect(new TextDecoder().decode(decrypted)).toBe("Hello, ZilPay!");
});

test("decrypt with wrong key does not return original content", () => {
  const key = new TextEncoder().encode("correctKey123456"); // 16-byte key
  const wrongKey = new TextEncoder().encode("wrongKey12345678"); // 16-byte key

  const content = new TextEncoder().encode("Secret message");
  const encrypted = CipherV3.encrypt(content, key);

  const decrypted = CipherV3.decrypt(encrypted, wrongKey);

  expect(decrypted).not.toEqual(content);
  expect(new TextDecoder().decode(decrypted)).not.toBe(
    new TextDecoder().decode(content),
  );
});

test("encrypt throws if key length is invalid", () => {
  const invalidKey = new TextEncoder().encode("shortkey"); // <16 bytes
  const content = new TextEncoder().encode("Data");

  expect(() => CipherV3.encrypt(content, invalidKey)).toThrowError(
    ErrorMessages.InvalidKeyLength,
  );
});

test("test AES-v2", async () => {
  let key = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";
  let content =
    "8bfed20592daf43ca798ee263fcca946013876e00f34aeab3f0836872ccc19da";
  let encrypted =
    "U2FsdGVkX19nN1qtOBORWCorbwujy5Nxm7bfehROWZn/vLrxMXuXJE3Bs1PLx2j0V/xd8Ts3e1QUv5EK9Hx4k+jnUVGFtB0Wcg+oVN4/3KcR5U54gxJUf9UTR6kWSQe5";
  let decrypted = await CipherV2.decrypt(encrypted, key);

  expect(decrypted).toEqual(content);
});

test("decrypt Storage v2 AES-v2", async () => {
  let vault = STORAGE_V2.vault;
  let password = utils.utf8.toBytes(PASSWORD);
  let keyBytes = await sha256(password);
  let key = utils.hex.fromBytes(keyBytes);
  let decrypted = await CipherV2.decrypt(vault, key);

  expect(decrypted).toEqual(WORDS);
});

test("decrypt accounts Storage v2 AES-v2", async () => {
  let accounts = JSON.parse(STORAGE_V2["wallet-identities"]);
  let identities = accounts.identities;
  let importedAccount = identities[1];
  let privKey = importedAccount.privKey;

  let password = utils.utf8.toBytes(PASSWORD);
  let keyBytes = await sha256(password);
  let key = utils.hex.fromBytes(keyBytes);

  let decrypted = await CipherV2.decrypt(privKey, key);

  expect(decrypted).toEqual(IMPORTED_KEY);
});
