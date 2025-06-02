import { describe, it, expect, vi } from "vitest";
import {
  derivePrivateKey,
  deriveChildKey,
  ChildNumber,
  Bip32Error,
  deriveMasterKey,
  Bip32ErrorCode,
} from "../../crypto/bip32";
import { Bip39 } from "../../crypto/bip39";
import { WORD_LIST } from "./word_list";
import { utils } from "aes-js";

describe("BIP-32 Derivation", () => {
  it("should derive correct private key from BIP-39 mnemonic", async () => {
    const phrase =
      "panda eyebrow bullet gorilla call smoke muffin taste mesh discover soft ostrich alcohol speed nation flash devote level hobby quick inner drive ghost inside";
    const expectedSecretKey =
      "ff1e68eb7bf2f48651c47ef0177eb815857322257c5894bb4cfd1176c9989314";
    const seed = await Bip39.mnemonicToSeed(phrase, "", WORD_LIST);
    const privateKey = await derivePrivateKey(seed, "m/44'/60'/0'/0/0");

    expect(utils.hex.fromBytes(privateKey)).toEqual(expectedSecretKey);
  });
});

describe("ChildNumber", () => {
  it("should correctly parse a hardened child number", () => {
    const childNumber = ChildNumber.fromString("44'");
    expect(childNumber.value).toBe(44 | 0x80000000);
    expect(childNumber.isHardened()).toBe(true);
  });

  it("should correctly parse a non-hardened child number", () => {
    const childNumber = ChildNumber.fromString("0");
    expect(childNumber.value).toBe(0);
    expect(childNumber.isHardened()).toBe(false);
  });

  it("should throw an error for invalid child number string", () => {
    expect(() => ChildNumber.fromString("invalid")).toThrow(Bip32Error);
  });

  it("should throw an error for negative child number", () => {
    expect(() => ChildNumber.fromString("-1")).toThrow(Bip32Error);
  });
});

describe("derivePrivateKey Error Handling", () => {
  it("should throw an error for invalid path", async () => {
    const seed = utils.hex.toBytes("000102030405060708090a0b0c0d0e0f");
    await expect(derivePrivateKey(seed, "invalid/path")).rejects.toThrow(
      Bip32Error,
    );
  });

  it("should throw an error for invalid child number in path", async () => {
    const seed = utils.hex.toBytes("000102030405060708090a0b0c0d0e0f");
    await expect(
      derivePrivateKey(seed, "m/44'/invalid'/0'/0/0"),
    ).rejects.toThrow(Bip32Error);
  });
});

describe("deriveChildKey", () => {
  const parentKey = utils.hex.toBytes(
    "e8f32e723decf4051aefc8e2e8929c9c53337309202da64260e18c95815ff8a1",
  );
  const chainCode = utils.hex.toBytes(
    "044108d81081692c577005ce106a7980ade51d384664082531e457e515d086c1",
  );

  it("should throw Bip32Error if hmacSha512 fails during child derivation", async () => {
    vi.spyOn(globalThis.crypto.subtle, "sign").mockImplementationOnce(
      async () => {
        throw new Error("Mock HMAC failure during child derivation");
      },
    );

    const childNumber = ChildNumber.fromString("0");

    await expect(
      deriveChildKey(parentKey, chainCode, childNumber),
    ).rejects.toThrow(Bip32Error);
    await expect(
      deriveChildKey(parentKey, chainCode, childNumber),
    ).rejects.toThrow(
      new Bip32Error(Bip32ErrorCode.InvalidKey, "Invalid parent key"),
    );
  });
});
