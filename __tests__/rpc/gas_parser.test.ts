import { describe, it, expect, vi } from "vitest";
import {
  buildFeeHistoryRequest,
  buildEvmEstimateGasRequest,
  buildBatchGasRequest,
  processParseFeeHistoryRequest,
  EIP1559,
  EIP4844,
  type FeeHistoryResult,
  type GasFeeHistory,
} from "../../background/rpc/gas_parse";
import { TransactionRequest } from "../../crypto/tx";
import { Address, AddressType } from "../../crypto/address";
import { EvmMethods, ZilMethods } from "../../config/jsonrpc";
import { hexToBigInt } from "../../lib/utils/hex";

describe("Gas Parser Utilities", () => {
  const mockEvmTx = { to: "0x...", data: "0x..." };
  const mockScillaTx = { a: "1" };
  const mockEvmSender = new Address(
    new Uint8Array(20),
    AddressType.EthCheckSum,
  );
  const mockZilSender = new Address(new Uint8Array(20), AddressType.Bech32);

  describe("buildFeeHistoryRequest", () => {
    it("should create a valid eth_feeHistory request payload", () => {
      const blockCount = 10;
      const percentiles = [10, 20, 30];
      const request = buildFeeHistoryRequest(blockCount, percentiles);

      expect(request.method).toBe(EvmMethods.FeeHistory);
      expect(request.params).toEqual([
        `0x${blockCount.toString(16)}`,
        "latest",
        percentiles,
      ]);
      expect(request.jsonrpc).toBe("2.0");
    });
  });

  describe("buildEvmEstimateGasRequest", () => {
    it("should create a valid eth_estimateGas request for an EVM transaction", () => {
      const tx = new TransactionRequest(
        {
          chainHash: 0,
        },
        undefined,
        mockEvmTx as any,
      );
      const request = buildEvmEstimateGasRequest(tx);

      expect(request.method).toBe(EvmMethods.EstimateGas);
      expect(request.params).toEqual([mockEvmTx]);
    });

    it("should throw NetworkError if the transaction is for Scilla", () => {
      const tx = new TransactionRequest(
        {
          chainHash: 0,
        },
        mockScillaTx as any,
        undefined,
      );
      expect(() => buildEvmEstimateGasRequest(tx)).toThrow(
        "Zilliqa network doesn't support gas estimation or EVM transaction is missing",
      );
    });
  });

  describe("processParseFeeHistoryRequest", () => {
    const mockFeeHistory: FeeHistoryResult = {
      baseFeePerGas: [
        "0x21149ce3",
        "0x20fde27c",
        "0x1fa69dae",
        "0x1e3966e7",
        "0x1fa68dd6",
      ],
      reward: [
        ["0x2faf080", "0x1dcd6500", "0x3b9aca04"],
        ["0x54e0840", "0x1dcd6500", "0x34323dde"],
        ["0x989680", "0x13f7d84f", "0x578ef652"],
        ["0x2faf080", "0x1dcd6500", "0x1dcd6500"],
      ],
      oldestBlock: "0x15a9cb6",
      gasUsedRatio: [0.48, 0.33, 0.31, 0.68],
    };

    it("should correctly parse a valid fee history response", () => {
      const result: GasFeeHistory =
        processParseFeeHistoryRequest(mockFeeHistory);
      const expectedBaseFee = hexToBigInt(mockFeeHistory.baseFeePerGas.at(-1)!);
      const expectedPriorityFee = hexToBigInt(mockFeeHistory.reward.at(-1)![1]);

      expect(result.baseFee).toBe(expectedBaseFee);
      expect(result.priorityFee).toBe(expectedPriorityFee);
      expect(result.maxFee).toBe(expectedBaseFee * 2n + expectedPriorityFee);
    });

    it("should throw an error if baseFeePerGas is missing", () => {
      const invalidHistory = { ...mockFeeHistory, baseFeePerGas: [] };
      expect(() => processParseFeeHistoryRequest(invalidHistory)).toThrow(
        "baseFeePerGas not found or empty in fee history",
      );
    });
  });

  describe("buildBatchGasRequest", () => {
    it("should build a batch request for a Zilliqa (Scilla) transaction", async () => {
      const tx = new TransactionRequest(
        { chainHash: 1 },
        mockScillaTx as any,
        undefined,
      );
      const requests = await buildBatchGasRequest(tx, 0, [], [], mockZilSender);

      expect(requests.length).toBe(2);
      expect(requests[0].method).toBe(ZilMethods.GetBalance);
      expect(requests[0].params).toEqual([
        "0000000000000000000000000000000000000000",
      ]);

      expect(requests[1].method).toBe(ZilMethods.GetMinimumGasPrice);
    });

    it("should build a basic batch request for an EVM transaction", async () => {
      const tx = new TransactionRequest(
        { chainHash: 2 },
        undefined,
        mockEvmTx as any,
      );
      const requests = await buildBatchGasRequest(
        tx,
        10,
        [],
        [],
        mockEvmSender,
      );

      expect(requests.length).toBe(3);
      expect(requests[0].method).toBe(EvmMethods.GetTransactionCount);
      expect(requests[0].params).toEqual([
        "0x0000000000000000000000000000000000000000",
        "latest",
      ]);

      expect(requests[1].method).toBe(EvmMethods.GasPrice);
      expect(requests[2].method).toBe(EvmMethods.EstimateGas);
    });

    it("should include EIP1559 requests when the feature is enabled", async () => {
      const tx = new TransactionRequest(
        { chainHash: 2 },
        undefined,
        mockEvmTx as any,
      );
      const requests = await buildBatchGasRequest(
        tx,
        10,
        [25, 75],
        [EIP1559],
        mockEvmSender,
      );

      expect(requests.length).toBe(5);
      const methods = requests.map((r) => r.method);
      expect(methods).toContain(EvmMethods.MaxPriorityFeePerGas);
      expect(methods).toContain(EvmMethods.FeeHistory);
    });

    it("should include EIP4844 request when the feature is enabled", async () => {
      const tx = new TransactionRequest(
        { chainHash: 2 },
        undefined,
        mockEvmTx as any,
      );
      const requests = await buildBatchGasRequest(
        tx,
        10,
        [],
        [EIP4844],
        mockEvmSender,
      );

      expect(requests.length).toBe(4);
      expect(requests.map((r) => r.method)).toContain(EvmMethods.BlobBaseFee);
    });

    it("should throw TransactionError if evm transaction is not provided for an EVM chain", async () => {
      const tx = new TransactionRequest({ chainHash: 2 }, undefined, undefined);
      await expect(
        buildBatchGasRequest(tx, 10, [], [], mockEvmSender),
      ).rejects.toThrow("unsupported transaction.");
    });
  });
});
