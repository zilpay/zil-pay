import { describe, expect, it } from "vitest";
import {
  toChecksumHexAddress,
  toChecksumBytesAddress,
} from "../../lib/zilliqa/checksum";
import { utils } from "aes-js";
import { toBech32Address, fromBech32Address } from "../../lib/zilliqa/bech32";
import { fromZilPubKey } from "lib/zilliqa/pubkey";

describe("Address Conversion Tests", () => {
  describe("toChecksumAddress", () => {
    it("should correctly checksum a valid lowercase address", async () => {
      const address = "8617b72e22090f0c13167865147ec48a6db788ff";
      const checksummed = await toChecksumHexAddress(address);
      expect(checksummed).toBe("0x8617B72E22090f0c13167865147eC48a6dB788ff");
    });

    it("should correctly checksum another valid address", async () => {
      const address = "0000000000000000000000000000000000000000";
      const checksummed = await toChecksumHexAddress(address);
      expect(checksummed).toBe("0x0000000000000000000000000000000000000000");
    });

    it("should correctly derive a bech32 address from a public key", async () => {
      const pubkeyHex =
        "03150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da";
      const pubkeyBytes = utils.hex.toBytes(pubkeyHex);
      const addrBytes = await fromZilPubKey(pubkeyBytes);
      const checksummed = await toChecksumBytesAddress(addrBytes);

      expect(checksummed).toBe("0xEBd8b370Dddb636FAF641040D2181c55190840fb");
    });
  });

  describe("toBech32Address", () => {
    it("should correctly encode a valid hexadecimal address to Bech32", async () => {
      const hexAddress = "0x7793a8e8c09d189d4d421ce5bc5b3674656c5ac1";
      const bech32Address = await toBech32Address(hexAddress);
      expect(bech32Address).toBe("zil1w7f636xqn5vf6n2zrnjmckekw3jkckkpyrd6z8");
    });
  });

  describe("fromBech32Address", () => {
    it("should correctly decode a valid Bech32 address to a checksummed hexadecimal address", async () => {
      const bech32Address = "zil1w7f636xqn5vf6n2zrnjmckekw3jkckkpyrd6z8";
      const hexAddress = fromBech32Address(bech32Address);
      expect(hexAddress).toBe("0x7793a8e8c09d189d4d421ce5bc5b3674656c5ac1");
    });

    it("should throw an error for an invalid Bech32 address length", async () => {
      const invalidBech32 = "zi21w7f636xqn5vf6n2zrnjmckekw3jkckkpyrd6z8";
      expect(() => fromBech32Address(invalidBech32)).toThrow();
    });

    it("should throw an error for a Bech32 address with an incorrect HRP", async () => {
      const wrongHRP = "btc1qwertzuiopasdfghjklmnbvcxy";
      expect(() => fromBech32Address(wrongHRP)).toThrow();
    });
  });
});
