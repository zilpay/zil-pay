import { describe, it, expect } from "vitest";
import { KeyPair, AddressType } from "../../crypto/keypair";
import { Bip39 } from "../../crypto/bip39";
import { ETHEREUM, ZILLIQA } from "../../config/slip44";
import { utils } from "aes-js";
import { WORDS, KEY, IMPORTED_KEY } from "../data";

describe("KeyPair", () => {
  describe("fromPrivateKey", () => {
    it("should create KeyPair for Zilliqa with correct address", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ZILLIQA);

      expect(keyPair.slip44).toBe(ZILLIQA);
      expect(keyPair.addressType()).toBe(AddressType.Bech32);
      expect(keyPair.privateKey).toEqual(privateKey);
      expect(await keyPair.addrFromPubKey()).toBe(
        "zil14at57zaj4pe3tuy734usy2xnlquapkd4d0ne43",
      );
    });

    it("should create KeyPair for Ethereum with correct address", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ETHEREUM);

      expect(keyPair.slip44).toBe(ETHEREUM);
      expect(keyPair.addressType()).toBe(AddressType.EthCheckSum);
      expect(keyPair.privateKey).toEqual(privateKey);
      expect(await keyPair.addrFromPubKey()).toBe(
        "0x709678c07cfCAFB4bb49a6b1d57b1db378e27825",
      );
    });
  });

  describe("fromSeed", () => {
    it("should create KeyPair for Zilliqa from seed with correct address", async () => {
      const seed = await Bip39.mnemonicToSeed(WORDS, "");
      const keyPair = await KeyPair.fromSeed(seed, ZILLIQA, 0);

      expect(keyPair.slip44).toBe(ZILLIQA);
      expect(keyPair.addressType()).toBe(AddressType.Bech32);
      expect(utils.hex.fromBytes(keyPair.privateKey)).toBe(KEY);
      expect(await keyPair.addrFromPubKey()).toBe(
        "zil1ntrynx04349sk6py7uyata03gka6qswg7um95y",
      );
    });

    it("should create KeyPair for Ethereum from seed with correct address", async () => {
      const seed = await Bip39.mnemonicToSeed(WORDS, "");
      const keyPair = await KeyPair.fromSeed(seed, ETHEREUM, 0);

      expect(keyPair.slip44).toBe(ETHEREUM);
      expect(keyPair.addressType()).toBe(AddressType.EthCheckSum);
      expect(await keyPair.addrFromPubKey()).toBe(
        "0xAEC7595CA9A57be828493bb73f07fA335a85B41d",
      );
    });
  });

  describe("signMessage", () => {
    it("should sign message for Zilliqa correctly", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ZILLIQA);
      const message = utils.utf8.toBytes("test message");
      const signature = await keyPair.signMessage(message);

      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBe(64); // Zilliqa schnorr signature length
    });

    it("should sign message for Ethereum correctly", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ETHEREUM);
      const message = utils.utf8.toBytes("test message");
      const signature = await keyPair.signMessage(message);

      console.log(signature);

      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBe(65); // Ethereum signature length (r,s,v)
    });
  });
});
