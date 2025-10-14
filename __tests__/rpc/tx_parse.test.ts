import { describe, it, expect } from "vitest";
import {
  buildSendSignedTxRequest,
  buildPayloadTxReceipt,
  processTxReceiptResponse,
  processTxSendResponse,
} from "../../background/rpc/tx_parse";
import { HistoricalTransaction } from "../../background/rpc/history_tx";
import { SignedTransaction, TransactionRequest } from "../../crypto/tx";
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";
import { EvmMethods, ZilMethods } from "../../config/jsonrpc";
import { utf8ToUint8Array } from "../../lib/utils/utf8";
import { Address } from "../../crypto/address";
import { KeyPair } from "../../crypto/keypair";
import { weieth, weigwei } from "micro-eth-signer";
import { generateErc20TransferData } from "../../background/rpc/ft_parser";
import { createBscConfig, createZilliqaConfig } from "../data";
import { TransactionStatus } from "../../config/tx";
import type {
  TransactionReceiptEVM,
  TransactionReceiptScilla,
  TransactionRequestEVM,
} from "../../types/tx";

describe("Transaction Parse Functions", () => {
  const ZIL_CONFIG = createZilliqaConfig();
  const BSC_CONFIG = createBscConfig();

  const createZilTransactionReceipt = async (): Promise<SignedTransaction> => {
    const keypair = await KeyPair.generate(ZIL_CONFIG.slip44);
    const toAddr = Address.fromStr(
      "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
    );
    const data = JSON.stringify({
      _tag: "Transfer",
      params: [
        {
          vname: "to",
          type: "ByStr20",
          value: "0x066b88d3411c68cb56219e748ae895e1734c0f51",
        },
        {
          vname: "amount",
          type: "Uint128",
          value: "355940000000000000000",
        },
      ],
    });

    const txZilReq = new ZILTransactionRequest(
      ZIL_CONFIG.chainId,
      BigInt(1),
      BigInt(2000) * BigInt(10 ** 6),
      BigInt(100000),
      toAddr.bytes,
      BigInt(1) * BigInt(10 ** 12),
      new Uint8Array(),
      utf8ToUint8Array(data),
    );

    const metadata = {
      chainHash: ZIL_CONFIG.hash(),
      token: {} as any,
    };

    const txReq = new TransactionRequest(metadata, txZilReq);
    const receipt = await txReq.sign(keypair);
    return receipt;
  };

  const createEvmTransactionReceipt = async (): Promise<SignedTransaction> => {
    const keypair = await KeyPair.generate(BSC_CONFIG.slip44);
    const tokenAddress = Address.fromStr(
      "0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc",
    );
    const recipient = Address.fromStr(
      "0x246C5881E3F109B2aF170F5C773EF969d3da581B",
    );
    const amount = weieth.decode("69");
    const transferData = generateErc20TransferData(
      await recipient.toEthChecksum(),
      amount,
    );

    const ethTx: TransactionRequestEVM = {
      to: await tokenAddress.toEthChecksum(),
      value: '0',
      maxFeePerGas: weigwei.decode("1").toString(),
      gasLimit: 24000,
      maxPriorityFeePerGas: '10',
      nonce: 0,
      chainId: BSC_CONFIG.chainId,
      data: transferData,
    };

    const metadata = {
      chainHash: BSC_CONFIG.hash(),
      token: {} as any,
    };

    const txReq = new TransactionRequest(metadata, undefined, ethTx);
    const receipt = await txReq.sign(keypair);
    return receipt;
  };

  const createZilHistoricalTransaction = (): HistoricalTransaction => {
    const scillaTx: TransactionReceiptScilla = {
      hash: "ce924ea2d0dca2c76af0b8c7858d0401a95f6528122c8f3cd1da11d22b2bb01a",
      amount: "10000000000000",
      senderPubKey: "0x1234567890123456789012345678901234567890",
      senderAddr: "zil1qsqa0l28av62z49c23nthg3ceecech2y34hpx5",
      toAddr: "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
      receipt: { 
        success: false, 
        accepted: false,
        gas_used: "0",
        cumulative_gas_used: "0",
        cumulative_gas: "0",
        epoch_num: "12345"
      },
      gasLimit: "50000",
      gasPrice: "2000000000",
      signature:
        "0x304402207fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0",
      nonce: "1",
      version: String(ZIL_CONFIG.chainId),
      priority: false,
    };

    return new HistoricalTransaction({
      status: TransactionStatus.Pending,
      timestamp: Math.floor(Date.now() / 1000) - 60,
      metadata: {
        chainHash: ZIL_CONFIG.hash(),
        token: {} as any,
      },
      scilla: scillaTx,
    });
};

const createEvmHistoricalTransaction = (): HistoricalTransaction => {
  const evmTx: TransactionReceiptEVM = {
    transactionHash:
      "0x9a65c7bd4b028cf6e24a184c2a35589c7287358926a1d4492e90c844eb6f37d3",
    from: "0x7d3034d6281900Af5Ac0b2615E3051884012AF1B",
    to: "0x7693F0eC4d80fbe8BeFA31aE845CDE344043dD6e",
    type: "0x2",
    value: "1000000000000000000",
    nonce: "1",
    status: "0x0",
    blockHash: "",
    blockNumber: "",
    contractAddress: null,
    cumulativeGasUsed: "0",
    effectiveGasPrice: "0",
    gasUsed: "0",
    logs: [],
    logsBloom: "",
    transactionIndex: "",
  };

  return new HistoricalTransaction({
    status: TransactionStatus.Pending,
    timestamp: Math.floor(Date.now() / 1000) - 60,
    scilla: undefined,
    metadata: {
      chainHash: BSC_CONFIG.hash(),
      token: {} as any,
    },
    evm: evmTx,
  });
};;

  describe("buildSendSignedTxRequest", () => {
    it("should build request for Zilliqa transaction", async () => {
      const tx = await createZilTransactionReceipt();
      const request = await buildSendSignedTxRequest(tx);

      expect(request.method).toBe(ZilMethods.CreateTransaction);
      expect(request.params).toHaveLength(1);
      expect(request.params[0]).toHaveProperty("version");
      expect(request.params[0]).toHaveProperty("nonce");
      expect(request.params[0]).toHaveProperty("amount");
    });

    it("should build request for EVM transaction", async () => {
      const tx = await createEvmTransactionReceipt();
      const request = await buildSendSignedTxRequest(tx);

      expect(request.method).toBe(EvmMethods.SendRawTransaction);
      expect(request.params).toHaveLength(1);
      expect(typeof request.params[0]).toBe("string");
      expect(request.params[0]).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it("should throw error for invalid transaction type", async () => {
      const invalidTx = new SignedTransaction({
        chainHash: 1,
        token: {} as any,
      });
      await expect(() => buildSendSignedTxRequest(invalidTx)).rejects.toThrow(
        "Invalid transaction type",
      );
    });
  });

  describe("buildPayloadTxReceipt", () => {
    it("should build request for Scilla transaction receipt", () => {
      const tx = createZilHistoricalTransaction();
      const request = buildPayloadTxReceipt(tx);

      expect(request.method).toBe(ZilMethods.GetTransaction);
      expect(request.params).toEqual([tx.scilla!.hash]);
    });

    it("should build request for EVM transaction receipt", () => {
      const tx = createEvmHistoricalTransaction();
      const request = buildPayloadTxReceipt(tx);

      expect(request.method).toBe(EvmMethods.GetTransactionReceipt);
      expect(request.params).toEqual([tx.evm!.transactionHash]);
    });

    it("should throw error for invalid chain type", () => {
      const tx = createZilHistoricalTransaction();
      tx.scilla = undefined; // Make it invalid
      expect(() => buildPayloadTxReceipt(tx)).toThrow("Invalid chain type");
    });
  });

  describe("processTxReceiptResponse", () => {
    it("should process successful Zilliqa transaction receipt", async () => {
      const tx = createZilHistoricalTransaction();
      const response = {
        jsonrpc: "2.0",
        id: "1",
        result: {
          "ID": "b25e482c62bae3c7adca3ef248726a795671dabc04ea2242bc23daa2d9e98d77",
          "version": "65537",
          "nonce": "1275",
          "toAddr": "ec6bb19886c9d5f5125dfc739362bf54aa23d51f",
          "senderPubKey": "0x02f006b10b35ed60ac7cb79866b228a048b7d820561ec917b1ad3d2e5a851cedb9",
          "amount": "1000000000000",
          "signature": "0x39e0de461479f976f09af6b8bd2f2303f36e9ea1e120baf3f82ae11effc4042641eeb0db83307f06a600e650d67307e27d75810e4d95827de0bd70f7b460298f",
          "receipt": {
            "accepted": false,
            "gas_used": "50",
            "cumulative_gas_used": "50",
            "cumulative_gas": "50",
            "epoch_num": "11037537",
            "transitions": [],
            "event_logs": [],
            "errors": {},
            "exceptions": [],
            "success": true
          },
          "gasPrice": "2000000016",
          "gasLimit": "50",
          "code": null,
          "data": null
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Success);
      expect(tx.scilla).toBeDefined();
      expect(tx.scilla!.amount).toBe("1000000000000");
      expect(tx.scilla!.gasLimit).toBe("50");
      expect(tx.scilla!.gasPrice).toBe("2000000016");
      expect(tx.scilla!.nonce).toBe("1275");
      expect(tx.scilla!.receipt?.success).toBe(true);
      expect(tx.scilla!.senderAddr).toBe(
        "zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace",
      );
      expect(tx.scilla!.senderPubKey).toBe(
        "0x02f006b10b35ed60ac7cb79866b228a048b7d820561ec917b1ad3d2e5a851cedb9",
      );
    });

    it("should process failed Zilliqa transaction", async () => {
      const tx = createZilHistoricalTransaction();
      const response = {
        jsonrpc: "2.0",
        id: "1",
        result: {
          ID: "some_id",
          receipt: { success: false, accepted: false },
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Failed);
      expect(tx.scilla).toBeDefined();
      expect(tx.scilla!.receipt?.success).toBe(false);
    });

    it("should handle Zilliqa transaction timeout (by becoming Failed)", async () => {
      const tx = createZilHistoricalTransaction();
      tx.timestamp = Math.floor(Date.now() / 1000) - 700; // 11+ minutes ago
      tx.status = TransactionStatus.Pending;

      const response = {
        id: 1,
        jsonrpc: "2.0",
        error: {
          code: -1,
          message: "Txn Hash not found",
        },
      };

      await processTxReceiptResponse(response, tx);

      // The function marks it as Failed if it's old and there's an error.
      expect(tx.status).toBe(TransactionStatus.Failed);
    });

    it("should process successful EVM transaction receipt", async () => {
      const tx = createEvmHistoricalTransaction();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          type: "0x0",
          from: "0x7d3034d6281900af5ac0b2615e3051884012af1b",
          to: "0x7693f0ec4d80fbe8befa31ae845cde344043dd6e",
          status: "0x1",
          gasUsed: "0x9a235",
          blockNumber: "0x314a8d6",
          effectiveGasPrice: "0x123",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Success);
      expect(tx.evm).toBeDefined();
      expect(tx.evm!.from).toBe(
        "0x7d3034d6281900af5ac0b2615e3051884012af1b",
      );
      expect(tx.evm!.to).toBe("0x7693f0ec4d80fbe8befa31ae845cde344043dd6e");
      expect(tx.evm!.blockNumber).toBe("0x314a8d6");
      expect(tx.evm!.gasUsed).toBe("0x9a235");
      expect(tx.evm!.effectiveGasPrice).toBe("0x123");
    });

    it("should process failed EVM transaction receipt", async () => {
      const tx = createEvmHistoricalTransaction();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          status: "0x0",
          gasUsed: "0x5208",
          effectiveGasPrice: "0x174876e800",
          from: "0x742d35Cc6634C0532925a3b8D6C9B5A6abc12345",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Failed);
      expect(tx.evm!.status).toBe("0x0");
    });

    it("should handle RPC error response for a recent tx (remain pending)", async () => {
      const tx = createZilHistoricalTransaction();
      tx.timestamp = Math.floor(Date.now() / 1000);

      const response = {
        id: 1,
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Transaction not found",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Pending);
    });

    it("should handle RPC error response for an old tx (become failed)", async () => {
      const tx = createZilHistoricalTransaction();
      // Timestamp is old
      tx.timestamp = Math.floor(Date.now() / 1000) - 700;

      const response = {
        id: 1,
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Transaction not found",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Failed);
    });
  });

  describe("processTxSendResponse", () => {
    it("should process successful Zilliqa transaction send", async () => {
      const tx = await createZilTransactionReceipt();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          Info: "Txn processed",
          TranID:
            "ce924ea2d0dca2c76af0b8c7858d0401a95f6528122c8f3cd1da11d22b2bb01a",
        },
      };

      const hash = processTxSendResponse(response, tx);

      expect(hash).toBe(
        "ce924ea2d0dca2c76af0b8c7858d0401a95f6528122c8f3cd1da11d22b2bb01a",
      );
    });

    it("should process successful EVM transaction send", async () => {
      const tx = await createEvmTransactionReceipt();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result:
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      };

      const hash = processTxSendResponse(response, tx);

      expect(hash).toBe(
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      );
    });

    it("should handle RPC error in send response", async () => {
      const tx = await createZilTransactionReceipt();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Insufficient funds",
        },
      };

      expect(() => processTxSendResponse(response, tx)).toThrow(
        "RPC Error: Insufficient funds",
      );
    });

    it("should handle missing TranID in Zilliqa response", async () => {
      const tx = await createZilTransactionReceipt();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          Info: "Txn processed",
        },
      };

      expect(() => processTxSendResponse(response, tx)).toThrow(
        "Invalid tx hash",
      );
    });

    it("should handle invalid EVM hash format", async () => {
      const tx = await createEvmTransactionReceipt();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: 123,
      };

      expect(() => processTxSendResponse(response, tx)).toThrow(
        "Invalid tx hash",
      );
    });

    it("should handle missing result in send response", async () => {
      const tx = await createZilTransactionReceipt();
      const response = {
        id: 1,
        jsonrpc: "2.0",
      };

      expect(() => processTxSendResponse(response, tx)).toThrow(
        "Invalid response: missing result",
      );
    });
  });
});
