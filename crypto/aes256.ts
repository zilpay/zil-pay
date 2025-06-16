import { Counter, ModeOfOperation } from "aes-js";
import { randomBytes } from "../crypto/random";
import { md5 } from "js-md5";
import { uint8ArrayToUtf8, utf8ToUint8Array } from "lib/utils/utf8";
import { hexToUint8Array, uint8ArrayToHex } from "lib/utils/hex";

export enum ErrorMessages {
  InvalidKeyLength = "Invalid key length provided. Key must be 16, 24, or 32 bytes.",
  IncorrectParams = "Password is not correct",
}

export const AESCipherV3 = Object.freeze({
  encrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
    if (![16, 24, 32].includes(key.length)) {
      throw new Error(ErrorMessages.InvalidKeyLength);
    }

    const entropy = randomBytes(16);
    const iv = new Counter(entropy);
    const aesCtr = new ModeOfOperation.ctr(key, iv);
    const encrypted = aesCtr.encrypt(content);
    const bytes = utf8ToUint8Array(
      `${uint8ArrayToHex(encrypted)}/${uint8ArrayToHex(entropy)}`,
    );
    return bytes;
  },
  decrypt(bytes: Uint8Array, key: Uint8Array): Uint8Array {
    if (![16, 24, 32].includes(key.length)) {
      throw new Error(ErrorMessages.InvalidKeyLength);
    }

    const [encrypted, iv] = uint8ArrayToUtf8(bytes).split("/");
    const counter = new Counter(hexToUint8Array(iv));
    const aesCtr = new ModeOfOperation.ctr(key, counter);
    return aesCtr.decrypt(hexToUint8Array(encrypted));
  },
});

export const AESCipherV2 = Object.freeze({
  async decrypt(data: Uint8Array, key: Uint8Array): Promise<any> {
    const combined = data;

    const prefix = new TextDecoder().decode(combined.slice(0, 8));
    if (prefix !== "Salted__") {
      throw new Error(ErrorMessages.IncorrectParams);
    }

    const salt = combined.slice(8, 16);
    const ciphertext = combined.slice(16);
    const passwordBytes = key;
    const { key: derivedKey, iv } = await AESCipherV2.evpKDF(
      passwordBytes,
      salt,
      32,
      16,
    );

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      derivedKey,
      { name: "AES-CBC" },
      false,
      ["decrypt"],
    );

    let decrypted: ArrayBuffer;
    try {
      decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        ciphertext,
      );
    } catch {
      throw new Error("ErrorMessages.IncorrectPassword");
    }

    const content = new TextDecoder().decode(decrypted);
    if (!content) {
      throw new Error("ErrorMessages.IncorrectPassword");
    }

    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  },

  async evpKDF(
    password: Uint8Array,
    salt: Uint8Array,
    keySize: number,
    ivSize: number,
  ): Promise<{ key: Uint8Array; iv: Uint8Array }> {
    const totalSize = keySize + ivSize;
    let derived = new Uint8Array(0);
    let previousBlock = new Uint8Array(0);

    while (derived.length < totalSize) {
      const input = new Uint8Array([...previousBlock, ...password, ...salt]);
      const block = await AESCipherV2.md5Hash(input);
      derived = new Uint8Array([...derived, ...block]);
      previousBlock = Uint8Array.from(block);
    }

    const key = derived.slice(0, keySize);
    const iv = derived.slice(keySize, keySize + ivSize);
    return { key, iv };
  },

  async md5Hash(data: Uint8Array): Promise<Uint8Array> {
    const hasher = md5.create();
    hasher.update(data);
    const hash = hasher.arrayBuffer();
    return new Uint8Array(hash);
  },
});
