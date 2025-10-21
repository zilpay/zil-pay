import { describe, it, expect, vi } from "vitest";
import {
  ERC721Helper,
  ERC1155Helper,
  buildNFTRequests,
  processEthNFTMetadataResponse,
  processZilNFTMetadataResponse,
  processEthNFTBalanceResponse,
  processZilNFTBalanceResponse,
  NFTMetadataField,
  NFTStandard,
  type ZRC6Init,
} from "../../background/rpc/nft_parser";
import { Address } from "../../crypto/address";
import { KeyPair } from "../../crypto/keypair";
import { EvmMethods, ZilMethods } from "../../config/jsonrpc";
import { ETHEREUM, ZILLIQA } from "../../config/slip44";
import { hexToUint8Array } from "../../lib/utils/hex";
import type { JsonRPCResponse } from "../../background/rpc/provider";

const pubKeyBytes = hexToUint8Array("03b0194095e799a6a5f2e81a79fde0a927906c130520f050db263f0d9acbece1ba");
const createEthAddress = () => Address.fromPubKey(pubKeyBytes, ETHEREUM);
const createZilAddress = () => Address.fromPubKey(pubKeyBytes, ZILLIQA);

describe("nft_parser", () => {
  describe("ERC721Helper", () => {
    const helper = new ERC721Helper();
    const ownerAddress = "0x1234567890123456789012345678901234567890";

    it('should correctly encode "name" function call', () => {
      const encoded = helper.encodeFunctionCall("name", []);
      expect(encoded).toBe("0x06fdde03");
    });

    it('should correctly encode "balanceOf" function call', () => {
      const encoded = helper.encodeFunctionCall("balanceOf", [ownerAddress]);
      expect(encoded).toContain("0x70a08231");
    });
  });

  describe("ERC1155Helper", () => {
    const helper = new ERC1155Helper();
    const ownerAddress = "0x1234567890123456789012345678901234567890";

    it('should correctly encode "balanceOf" function call', () => {
      const encoded = helper.encodeFunctionCall("balanceOf", [ownerAddress, 1n]);
      expect(encoded).toContain("0x00fdd58e");
    });
  });

  describe("buildNFTRequests", () => {
    it("should build requests for an ERC721 NFT", async () => {
      const contract = await createEthAddress();
      const pubKeys = [pubKeyBytes];
      
      const mockProvider = {
        req: vi.fn().mockResolvedValue({
          result: "0x0000000000000000000000000000000000000000000000000000000000000001"
        })
      } as any;

      const requests = await buildNFTRequests(contract, pubKeys, mockProvider);

      expect(requests.length).toBeGreaterThan(0);
      expect(requests[0].payload.method).toBe(EvmMethods.Call);
    });

    it("should build requests for a ZRC6 NFT", async () => {
      const contract = await createZilAddress();
      const pubKeys = [pubKeyBytes];
      
      const mockProvider = {} as any;
      const requests = await buildNFTRequests(contract, pubKeys, mockProvider);

      expect(requests[0].payload.method).toBe(ZilMethods.GetSmartContractInit);
    });
  });

  describe("processEthNFTMetadataResponse", () => {
    it("should process name", () => {
      const mockResponse: JsonRPCResponse<string> = {
        id: 1,
        jsonrpc: "2.0",
        result: "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000047465737400000000000000000000000000000000000000000000000000000000",
      };
      const name = processEthNFTMetadataResponse(
        mockResponse,
        NFTMetadataField.Name,
        NFTStandard.ERC721,
      );
      expect(name).toBe("test");
    });

    it("should handle empty response", () => {
      const mockResponse: JsonRPCResponse<string> = {
        id: 1,
        jsonrpc: "2.0",
        result: "0x",
      };
      const name = processEthNFTMetadataResponse(
        mockResponse,
        NFTMetadataField.Name,
        NFTStandard.ERC721,
      );
      expect(name).toBe("");
    });
  });

  describe("processZilNFTMetadataResponse", () => {
    it("should process ZRC6 metadata", () => {
      const mockInitData: ZRC6Init[] = [
        { vname: "name", type: "String", value: "Test NFT" },
        { vname: "symbol", type: "String", value: "TNFT" },
        { vname: "base_uri", type: "String", value: "https://test.com/" },
        { vname: "token_owners", type: "Map", value: "{}" },
      ];
      const mockResponse: JsonRPCResponse<ZRC6Init[]> = {
        id: 1,
        jsonrpc: "2.0",
        result: mockInitData,
      };

      const { name, symbol, baseURI } = processZilNFTMetadataResponse(mockResponse);

      expect(name).toBe("Test NFT");
      expect(symbol).toBe("TNFT");
      expect(baseURI).toBe("https://test.com/");
    });
  });

  describe("processEthNFTBalanceResponse", () => {
    it("should process balance", () => {
      const mockResponse: JsonRPCResponse<string> = {
        id: 1,
        jsonrpc: "2.0",
        result: "0x0000000000000000000000000000000000000000000000000000000000000003",
      };
      const balance = processEthNFTBalanceResponse(mockResponse);
      expect(balance).toBe(3n);
    });

    it("should return 0 for empty response", () => {
      const mockResponse: JsonRPCResponse<string> = {
        id: 1,
        jsonrpc: "2.0",
        result: "0x",
      };
      const balance = processEthNFTBalanceResponse(mockResponse);
      expect(balance).toBe(0n);
    });
  });

  describe("processZilNFTBalanceResponse", () => {
    it("should process ZRC6 balance count", async () => {
      const keypair = await KeyPair.generate(ZILLIQA);
      const mockAccount = await keypair.address();
      const checksumAddress = (await mockAccount.toZilChecksum()).toLowerCase();

      const mockResponse: JsonRPCResponse<{ [key: string]: string }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          [checksumAddress]: "5",
        },
      };

      const result = await processZilNFTBalanceResponse(mockResponse, mockAccount);
      expect(result.balance).toBe(5n);
      expect(result.tokens).toBeUndefined();
    });

    it("should process ZRC6 tokens with IDs", async () => {
      const keypair = await KeyPair.generate(ZILLIQA);
      const mockAccount = await keypair.address();
      const checksumAddress = (await mockAccount.toZilChecksum()).toLowerCase();

      const mockResponse: JsonRPCResponse<{ [key: string]: any }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          [checksumAddress]: {
            "123": "0",
            "456": "1",
            "789": "0",
          },
        },
      };

      const result = await processZilNFTBalanceResponse(mockResponse, mockAccount);
      expect(result.balance).toBe(3n);
      expect(result.tokens).toBeDefined();
      expect(result.tokens!["123"].id).toBe("123");
      expect(result.tokens!["456"].id).toBe("456");
      expect(result.tokens!["789"].id).toBe("789");
    });

    it("should return 0 if error", async () => {
      const mockAccount = await createZilAddress();
      const mockResponse: JsonRPCResponse<any> = {
        id: 1,
        jsonrpc: "2.0",
        error: { code: -5, message: "Account is not created" },
      };
      const result = await processZilNFTBalanceResponse(mockResponse, mockAccount);
      expect(result.balance).toBe(0n);
    });
  });
});
