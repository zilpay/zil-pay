import { describe, it, expect } from "vitest";
import {
  buildNonceRequest,
  processNonceResponse,
  type ZilBalance,
} from "../../background/rpc/nonce_parser";
import { EvmMethods, ZilMethods } from "../../config/jsonrpc";
import { AddressType } from "../../config/wallet";

describe("Nonce Handling Logic", () => {
  describe("buildNonceRequest", () => {
    const bech32Address = "zil1w7f636xqn5vf6n2zrnjmckekw3jkckkpyrd6z8";
    const ethAddress = "0x7793a8e8c09d189d4d421ce5bc5b3674656c5ac1";

    it("should create a correct request payload for a Zilliqa (Bech32) address", async () => {
      // Await the async function
      const request = await buildNonceRequest(
        AddressType.Bech32,
        bech32Address,
      );

      expect(request.method).toBe(ZilMethods.GetBalance);
      // The hex address from a bech32 address conversion
      expect(request.params).toEqual([
        "7793a8e8c09d189d4d421ce5bc5b3674656c5ac1",
      ]);
      expect(request.jsonrpc).toBe("2.0");
    });

    it("should create a correct request payload for an Ethereum (Checksum) address", async () => {
      // Await the async function
      const request = await buildNonceRequest(
        AddressType.EthCheckSum,
        ethAddress,
      );
      // Correct checksum for Ethereum addresses
      const checksummedAddress = "0x7793A8E8c09d189d4D421Ce5bC5B3674656c5Ac1";

      expect(request.method).toBe(EvmMethods.GetTransactionCount);
      expect(request.params).toEqual([checksummedAddress, "latest"]);
      expect(request.jsonrpc).toBe("2.0");
    });

    it("should throw an error for an unsupported address type", async () => {
      const unsupportedType = 99 as AddressType; // Use a value not in the enum
      // Test for a rejected promise since the function is async
      await expect(
        buildNonceRequest(unsupportedType, "some_address"),
      ).rejects.toThrow("Unsupported address type");
    });
  });

  describe("processNonceResponse", () => {
    it("should correctly parse the nonce from a Zilliqa balance object", () => {
      const zilResponse: ZilBalance = {
        balance: "1000000000000",
        nonce: 42,
      };
      const nonce = processNonceResponse(zilResponse);
      expect(nonce).toBe(42);
    });

    it("should return 0 if the nonce is missing from the Zilliqa response", () => {
      const zilResponse = { balance: "1000000000000" } as ZilBalance;
      const nonce = processNonceResponse(zilResponse);
      expect(nonce).toBe(0);
    });

    it("should correctly parse the nonce from an Ethereum hex string response", () => {
      const ethResponse = "0x2a"; // Hex for 42
      const nonce = processNonceResponse(ethResponse);
      expect(nonce).toBe(42);
    });

    it("should return 0 for a zero value hex string", () => {
      const ethResponse = "0x0";
      const nonce = processNonceResponse(ethResponse);
      expect(nonce).toBe(0);
    });

    it("should return 0 for a non-string, non-object response", () => {
      const invalidResponse: any = 123;
      const nonce = processNonceResponse(invalidResponse);
      expect(nonce).toBe(0);
    });
  });
});
