import { describe, it, expect } from "vitest";
import {
  ERC20Helper,
  buildTokenRequests,
  processEthMetadataResponse,
  processZilMetadataResponse,
  processEthBalanceResponse,
  processZilBalanceResponse,
  generateErc20TransferData,
  MetadataField,
  type GetTokenInitItem,
  type ZilBalanceResponse,
  type ZilSmartContractSubStateResponse,
} from "../../background/rpc/ft_parser";
import { Address } from "../../crypto/address";
import { KeyPair } from "../../crypto/keypair";
import { EvmMethods, ZilMethods } from "../../config/jsonrpc";
import { ZILLIQA } from "../../config/slip44";
import type { JsonRPCResponse } from "../../background/rpc/provider";

const createEthAddress = () =>
  Address.fromStr("0x0089d53F703f7E0843953D48133f74cE247184c2");
const createZilAddress = () =>
  Address.fromStr("zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz");

describe("ft_parser", () => {
  describe("ERC20Helper", () => {
    const helper = new ERC20Helper();
    const toAddress = "0x1234567890123456789012345678901234567890";
    const amount = 1000n;

    it('should correctly encode "name" function call', () => {
      const encoded = helper.encodeFunctionCall("name", []);
      expect(encoded).toBe("0x06fdde03");
    });

    it('should correctly encode "symbol" function call', () => {
      const encoded = helper.encodeFunctionCall("symbol", []);
      expect(encoded).toBe("0x95d89b41");
    });

    it('should correctly encode "decimals" function call', () => {
      const encoded = helper.encodeFunctionCall("decimals", []);
      expect(encoded).toBe("0x313ce567");
    });

    it('should correctly encode "balanceOf" function call', () => {
      const encoded = helper.encodeFunctionCall("balanceOf", [toAddress]);
      const expected = `0x70a08231000000000000000000000000${toAddress.slice(2)}`;
      expect(encoded).toBe(expected);
    });

    it('should correctly encode "transfer" function call', () => {
      const encoded = helper.encodeFunctionCall("transfer", [
        toAddress,
        amount,
      ]);
      const expected = `0xa9059cbb000000000000000000000000${toAddress.slice(2)}00000000000000000000000000000000000000000000000000000000000003e8`;
      expect(encoded).toBe(expected);
    });

    it("should generate transfer input data", () => {
      const to = "0x0101010101010101010101010101010101010101";
      const amount = 1000000000000000000n;
      const transferData = generateErc20TransferData(to, amount);
      const expectedData =
        "0xa9059cbb00000000000000000000000001010101010101010101010101010101010101010000000000000000000000000000000000000000000000000de0b6b3a7640000";
      expect(transferData).toBe(expectedData);
    });
  });

  describe("buildTokenRequests", () => {
    it("should build requests for an ETH (ERC20) token", async () => {
      const contract = createEthAddress();
      const accounts = [createEthAddress()];
      const requests = await buildTokenRequests(contract, accounts, false);

      expect(requests).toHaveLength(4);

      const metadataReqs = requests.filter(
        (r) => r.requestType.type === "Metadata",
      );
      const balanceReqs = requests.filter(
        (r) => r.requestType.type === "Balance",
      );

      expect(metadataReqs).toHaveLength(3);
      expect(balanceReqs).toHaveLength(1);

      expect(requests[0].payload.method).toBe(EvmMethods.Call);
      expect(requests[3].payload.method).toBe(EvmMethods.Call);
    });

    it("should build requests for a native ETH balance", async () => {
      const contract = createEthAddress();
      const accounts = [createEthAddress()];
      const requests = await buildTokenRequests(contract, accounts, true);

      expect(requests).toHaveLength(4);
      expect(requests[3].payload.method).toBe(EvmMethods.GetBalance);
    });

    it("should build requests for a ZIL (ZRC2) token", async () => {
      const contract = createZilAddress();
      const accounts = [createZilAddress()];
      const requests = await buildTokenRequests(contract, accounts, false);

      expect(requests).toHaveLength(2);
      expect(requests[0].payload.method).toBe(ZilMethods.GetSmartContractInit);
      expect(requests[1].payload.method).toBe(
        ZilMethods.GetSmartContractSubState,
      );
    });

    it("should build requests for a native ZIL balance", async () => {
      const contract = createZilAddress();
      const accounts = [createZilAddress()];
      const requests = await buildTokenRequests(contract, accounts, true);

      expect(requests).toHaveLength(2);
      expect(requests[0].payload.method).toBe(ZilMethods.GetSmartContractInit);
      expect(requests[1].payload.method).toBe(ZilMethods.GetBalance);
    });
  });

  describe("Response Processing", () => {
    describe("ETH", () => {
      it("should process ETH metadata response for name", () => {
        const mockResponse: JsonRPCResponse<string> = {
          id: 1,
          jsonrpc: "2.0",
          result:
            "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000047465737400000000000000000000000000000000000000000000000000000000",
        };
        const name = processEthMetadataResponse(
          mockResponse,
          MetadataField.Name,
        );
        expect(name).toBe("test");
      });

      it("should process ETH metadata response for decimals", () => {
        const mockResponse: JsonRPCResponse<string> = {
          id: 1,
          jsonrpc: "2.0",
          result:
            "0x0000000000000000000000000000000000000000000000000000000000000012",
        };
        const decimals = processEthMetadataResponse(
          mockResponse,
          MetadataField.Decimals,
        );
        expect(decimals).toBe("18");
      });

      it("should process ETH balance response", () => {
        const mockResponse: JsonRPCResponse<string> = {
          id: 1,
          jsonrpc: "2.0",
          result:
            "0x0000000000000000000000000000000000000000000000000000000000000064",
        };
        const balance = processEthBalanceResponse(mockResponse);
        expect(balance).toBe(100n);
      });

      it("should handle invalid hex for ETH balance response", () => {
        const mockResponse: JsonRPCResponse<string> = {
          id: 1,
          jsonrpc: "2.0",
          result: "0xinvalidhex",
        };
        expect(() => processEthBalanceResponse(mockResponse)).toThrow();
      });

      it("should throw error for invalid ETH response", () => {
        const mockResponse: JsonRPCResponse<string> = {
          id: 1,
          jsonrpc: "2.0",
          error: { code: -32000, message: "Invalid request" },
        };
        expect(() =>
          processEthMetadataResponse(mockResponse, MetadataField.Name),
        ).toThrow("RPC Error (code: -32000): Invalid request");
      });
    });

    describe("ZIL", () => {
      it("should process ZIL metadata response", () => {
        const mockInitData: GetTokenInitItem[] = [
          { vname: "name", type: "String", value: "Test Token" },
          { vname: "symbol", type: "String", value: "TEST" },
          { vname: "decimals", type: "Uint32", value: "12" },
        ];
        const mockResponse: JsonRPCResponse<GetTokenInitItem[]> = {
          id: 1,
          jsonrpc: "2.0",
          result: mockInitData,
        };

        const { name, symbol, decimals } =
          processZilMetadataResponse(mockResponse);

        expect(name).toBe("Test Token");
        expect(symbol).toBe("TEST");
        expect(decimals).toBe(12);
      });

      it("should throw error for missing field in ZIL metadata", () => {
        const mockInitData: GetTokenInitItem[] = [
          { vname: "name", type: "String", value: "Test Token" },
        ];
        const mockResponse: JsonRPCResponse<GetTokenInitItem[]> = {
          id: 1,
          jsonrpc: "2.0",
          result: mockInitData,
        };
        expect(() => processZilMetadataResponse(mockResponse)).toThrow(
          "Invalid contract init: missing symbol",
        );
      });

      it("should process native ZIL balance response", async () => {
        const mockAccount = createZilAddress();
        const mockResponse: JsonRPCResponse<ZilBalanceResponse> = {
          id: 1,
          jsonrpc: "2.0",
          result: {
            balance: "12345",
            nonce: 2,
          },
        };

        const balance = await processZilBalanceResponse(
          mockResponse,
          mockAccount,
          true,
        );
        expect(balance).toBe(12345n);
      });

      it("should process ZRC2 token balance response", async () => {
        const keypair = await KeyPair.generate(ZILLIQA);
        const mockAccount = await keypair.address();
        const checksumAddress = (
          await mockAccount.toZilChecksum()
        ).toLowerCase();

        const mockResponse: JsonRPCResponse<ZilSmartContractSubStateResponse> =
          {
            id: 1,
            jsonrpc: "2.0",
            result: {
              balances: {
                [checksumAddress]: "54321",
              },
            },
          };

        const balance = await processZilBalanceResponse(
          mockResponse,
          mockAccount,
          false,
        );
        expect(balance).toBe(54321n);
      });

      it("should return 0 for ZRC2 balance if account not in response", async () => {
        const mockAccount = createZilAddress();
        const someOtherChecksumAddress =
          "0x01a6a0332f64285c73ea9fca4dca701e1e5ddf96";

        const mockResponse: JsonRPCResponse<ZilSmartContractSubStateResponse> =
          {
            id: 1,
            jsonrpc: "2.0",
            result: {
              balances: {
                [someOtherChecksumAddress]: "199636063226083796",
              },
            },
          };

        const balance = await processZilBalanceResponse(
          mockResponse,
          mockAccount,
          false,
        );
        expect(balance).toBe(0n);
      });

      it("should return 0 if ZIL response has an error", async () => {
        const mockAccount = createZilAddress();
        const mockResponse: JsonRPCResponse<any> = {
          id: 1,
          jsonrpc: "2.0",
          error: { code: -1, message: "Error" },
        };
        const balance = await processZilBalanceResponse(
          mockResponse,
          mockAccount,
          true,
        );
        expect(balance).toBe(0n);
      });
    });
  });
});
