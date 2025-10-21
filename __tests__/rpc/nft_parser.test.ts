import { describe, it, expect, vi } from "vitest";
import {
  ERC721Helper,
  ERC1155Helper,
  buildNFTRequests,
  processEthNFTMetadataResponse,
  processZilNFTMetadataResponse,
  processEthNFTBalanceResponse,
  processZilNFTBalanceResponse,
  processZilBaseUriResponse,
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

      expect(requests.length).toBe(4);
      expect(requests[0].payload.method).toBe(ZilMethods.GetSmartContractInit);
      expect(requests[1].payload.method).toBe(ZilMethods.GetSmartContractSubState);
      expect(requests[2].payload.method).toBe(ZilMethods.GetSmartContractSubState);
      expect(requests[3].payload.method).toBe(ZilMethods.GetSmartContractSubState);
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
        { vname: "initial_contract_owner", type: "ByStr20", value: "0x1234567890123456789012345678901234567890" },
      ];
      const mockResponse: JsonRPCResponse<ZRC6Init[]> = {
        id: 1,
        jsonrpc: "2.0",
        result: mockInitData,
      };

      const { name, symbol } = processZilNFTMetadataResponse(mockResponse);

      expect(name).toBe("Test NFT");
      expect(symbol).toBe("TNFT");
    });
  });

  describe("processZilBaseUriResponse", () => {
    it("should process base_uri", () => {
      const mockResponse: JsonRPCResponse<{ base_uri?: string }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          base_uri: "https://test.com/"
        },
      };

      const baseUri = processZilBaseUriResponse(mockResponse);
      expect(baseUri).toBe("https://test.com/");
    });

    it("should return undefined if base_uri not present", () => {
      const mockResponse: JsonRPCResponse<{ base_uri?: string }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {},
      };

      const baseUri = processZilBaseUriResponse(mockResponse);
      expect(baseUri).toBeUndefined();
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
    it("should process ZRC6 balance with token owners and uris", async () => {
      const keypair = await KeyPair.generate(ZILLIQA);
      const mockAccount = await keypair.address();
      const checksumAddress = (await mockAccount.toZilChecksum()).toLowerCase();

      const tokenOwnersResponse: JsonRPCResponse<{ token_owners?: Record<string, string> }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          token_owners: {
            "1": checksumAddress,
            "2": checksumAddress,
            "3": "0x0000000000000000000000000000000000000000",
          }
        },
      };

      const tokenUrisResponse: JsonRPCResponse<{ token_uris?: Record<string, string> }> = {
        id: 2,
        jsonrpc: "2.0",
        result: {
          token_uris: {
            "1": "https://example.com/1.json",
            "2": "https://example.com/2.json",
          }
        },
      };

      const baseUri = "https://base.com/";
      const pubKeys = [keypair.pubKey];

      const result = await processZilNFTBalanceResponse(
        tokenOwnersResponse,
        tokenUrisResponse,
        baseUri,
        pubKeys
      );

      const pubKeyHash = Number(Object.keys(result.balances)[0]);
      const userTokens = result.balances[pubKeyHash];

      expect(Object.keys(userTokens).length).toBe(2);
      expect(userTokens["1"].id).toBe("1");
      expect(userTokens["1"].url).toBe("https://example.com/1.json");
      expect(userTokens["2"].id).toBe("2");
      expect(userTokens["2"].url).toBe("https://example.com/2.json");
    });

    it("should use baseUri when token_uri is missing", async () => {
      const keypair = await KeyPair.generate(ZILLIQA);
      const mockAccount = await keypair.address();
      const checksumAddress = (await mockAccount.toZilChecksum()).toLowerCase();

      const tokenOwnersResponse: JsonRPCResponse<{ token_owners?: Record<string, string> }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          token_owners: {
            "10": checksumAddress,
          }
        },
      };

      const tokenUrisResponse: JsonRPCResponse<{ token_uris?: Record<string, string> }> = {
        id: 2,
        jsonrpc: "2.0",
        result: {
          token_uris: {}
        },
      };

      const baseUri = "https://base.com/nft/";
      const pubKeys = [keypair.pubKey];

      const result = await processZilNFTBalanceResponse(
        tokenOwnersResponse,
        tokenUrisResponse,
        baseUri,
        pubKeys
      );

      const pubKeyHash = Number(Object.keys(result.balances)[0]);
      const userTokens = result.balances[pubKeyHash];

      expect(userTokens["10"].url).toBe("https://base.com/nft/10");
    });

    it("should return empty balances for account with no tokens", async () => {
      const keypair = await KeyPair.generate(ZILLIQA);

      const tokenOwnersResponse: JsonRPCResponse<{ token_owners?: Record<string, string> }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          token_owners: {
            "1": "0x0000000000000000000000000000000000000000",
          }
        },
      };

      const tokenUrisResponse: JsonRPCResponse<{ token_uris?: Record<string, string> }> = {
        id: 2,
        jsonrpc: "2.0",
        result: {
          token_uris: {}
        },
      };

      const pubKeys = [keypair.pubKey];

      const result = await processZilNFTBalanceResponse(
        tokenOwnersResponse,
        tokenUrisResponse,
        undefined,
        pubKeys
      );

      const pubKeyHash = Number(Object.keys(result.balances)[0]);
      const userTokens = result.balances[pubKeyHash];

      expect(Object.keys(userTokens).length).toBe(0);
    });
  });
});
