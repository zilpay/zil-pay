import { describe, it, expect } from "vitest";
import { Signature } from "@noble/secp256k1";
import { KeyPair, AddressType } from "../../crypto/keypair";
import { Bip39 } from "../../crypto/bip39";
import { ETHEREUM, ZILLIQA } from "../../config/slip44";
import { utils } from "aes-js";
import { WORDS, KEY, IMPORTED_KEY } from "../data";
import { verify } from "../../crypto/zilliqa/schnorr";
import { randomBytes } from "../../crypto/random";

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
      expect(signature.length).toBe(64);
      expect(
        await verify(message, keyPair.pubKey, Signature.fromBytes(signature)),
      ).toBeTruthy();
      expect(await keyPair.verifySig(message, signature)).toBeTruthy();
    });

    it("should sign message for Ethereum correctly", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ETHEREUM);
      const message = utils.utf8.toBytes("test message");
      const signature = await keyPair.signMessage(message);

      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBe(65);
      expect(await keyPair.verifySig(message, signature)).toBeTruthy();
    });
  });

  describe("EIP-712", () => {
    const types = {
      Mail: [
        { name: "from", type: "string" },
        { name: "to", type: "string" },
        { name: "contents", type: "string" },
      ],
    } as const;

    const domain = {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    };

    const message = {
      from: "Alice",
      to: "Bob",
      contents: "Hello, Bob!",
    };

    const typedData = {
      types,
      primaryType: "Mail",
      domain,
      message,
    };

    it("should throw error for Zilliqa EIP-712 signing", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ZILLIQA);

      expect(() => keyPair.signDataEIP712(typedData)).toThrowError(
        "Unsupported",
      );
    });

    it("should throw error for Zilliqa EIP-712 verification", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ZILLIQA);
      const signature = new Uint8Array(65); // Dummy signature
      const address = "0x709678c07cfCAFB4bb49a6b1d57b1db378e27825";

      await expect(
        keyPair.verifyTypedEIP712(signature, typedData, address),
      ).rejects.toThrowError("Unsupported");
    });

    it("should sign EIP-712 data for Ethereum correctly", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ETHEREUM);
      const signature = keyPair.signDataEIP712(typedData);

      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBe(65); // Ethereum EIP-712 signature length
    });

    it("should verify EIP-712 signature for Ethereum correctly", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ETHEREUM);
      const signature = keyPair.signDataEIP712(typedData);
      const address = await keyPair.addrFromPubKey();

      const isValid = await keyPair.verifyTypedEIP712(
        signature,
        typedData,
        address,
      );
      expect(isValid).toBeTruthy();
    });

    it("should fail to verify EIP-712 with invalid signature", async () => {
      const privateKey = Uint8Array.from(utils.hex.toBytes(IMPORTED_KEY));
      const keyPair = await KeyPair.fromPrivateKey(privateKey, ETHEREUM);

      const differentMessage = {
        from: "Alice",
        to: "Charlie",
        contents: "Hello, Charlie!",
      };
      const invalidTypedData = {
        types,
        primaryType: "Mail",
        domain,
        message: differentMessage,
      };
      const invalidSignature = keyPair.signDataEIP712(invalidTypedData); 
      const address = await keyPair.addrFromPubKey();

      const isValid = await keyPair.verifyTypedEIP712(
        invalidSignature,
        typedData,
        address,
      );
      expect(isValid).toBeFalsy();
    });
  });

    it("should sign typed data EIP-712 successfully for Ethereum", async () => {
    const privateKey = randomBytes(32);
    const keyPair = await KeyPair.fromPrivateKey(privateKey, ETHEREUM);

    const address = await keyPair.addrFromPubKey();

    const typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
      },
      primaryType: "Person",
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      message: {
        name: "Bob",
        wallet: address,
      },
    };

    const signature = keyPair.signDataEIP712(typedData);

    expect(signature).toBeInstanceOf(Uint8Array);
    expect(signature.length).toBe(65); 
    const isValid = await keyPair.verifyTypedEIP712(signature, typedData, address);
    expect(isValid).toBeTruthy();
  });

  it("should throw error for EIP-712 signing with Zilliqa (unsupported type)", async () => {
    const privateKey = randomBytes(32);
    const keyPair = await KeyPair.fromPrivateKey(privateKey, ZILLIQA);
    const typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
      },
      primaryType: "Person",
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      message: {
        name: "Bob",
        wallet: "0xbBbBBBBbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
    };

    expect(() => keyPair.signDataEIP712(typedData)).toThrowError("Unsupported");
  });
});

