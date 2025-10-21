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

  describe("processEthNFTBalanceResponse", () => {
    it("should process balance", () => {
      const mockResponse: JsonRPCResponse<string> = {
        id: 1,
        jsonrpc: "2.0",
        result: "0x0000000000000000000000000000000000000000000000000000000000000003",
      };
      const balance = processEthNFTBalanceResponse(mockResponse, NFTStandard.ERC721);
      expect(balance).toBe(3n);
    });

    it("should return 0 for empty response", () => {
      const mockResponse: JsonRPCResponse<string> = {
        id: 1,
        jsonrpc: "2.0",
        result: "0x",
      };
      const balance = processEthNFTBalanceResponse(mockResponse, NFTStandard.ERC721);
      expect(balance).toBe(0n);
    });
  });

  describe("processZilNFTBalanceResponse", () => {
    it("should process ZRC6 balance", async () => {
      const keypair = await KeyPair.generate(ZILLIQA);
      const mockAccount = await keypair.address();
      const checksumAddress = (await mockAccount.toZilChecksum()).toLowerCase();

      const mockResponse: JsonRPCResponse<{ balances: Record<string, string> }> = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          balances: {
            [checksumAddress]: "5",
          },
        },
      };

      const balance = await processZilNFTBalanceResponse(mockResponse, mockAccount);
      expect(balance).toBe(5n);
    });

    it("should return 0 if error", async () => {
      const mockAccount = await createZilAddress();
      const mockResponse: JsonRPCResponse<any> = {
        id: 1,
        jsonrpc: "2.0",
        error: { code: -5, message: "Account is not created" },
      };
      const balance = await processZilNFTBalanceResponse(mockResponse, mockAccount);
      expect(balance).toBe(0n);
    });
  });
});
