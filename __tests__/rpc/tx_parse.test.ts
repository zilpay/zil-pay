import { describe, it, expect } from "vitest";
import {
  buildSendSignedTxRequest,
  buildPayloadTxReceipt,
  processTxReceiptResponse,
  processTxSendResponse,
} from "../../background/rpc/tx_parse";
import {
  HistoricalTransaction,
  TransactionStatus,
} from "../../background/rpc/history_tx";
import { TransactionReceipt, TransactionRequest } from "../../crypto/tx";
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";
import { EvmMethods, ZilMethods } from "../../config/jsonrpc";
import { uint8ArrayToHex } from "../../lib/utils/hex";
import { utf8ToUint8Array } from "../../lib/utils/utf8";
import { Address } from "../../crypto/address";
import { KeyPair } from "../../crypto/keypair";
import { randomBytes } from "../../crypto/random";
import { Transaction, weieth, weigwei } from "micro-eth-signer";
import { generateErc20TransferData } from "../../background/rpc/ft_parser";
import { createBscConfig, createZilliqaConfig } from "../data";

describe("Transaction Parse Functions", () => {
  const ZIL_CONFIG = createZilliqaConfig();
  const BSC_CONFIG = createBscConfig();

  const createZilTransactionReceipt = async (): Promise<TransactionReceipt> => {
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
      42,
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
    };

    const txReq = new TransactionRequest(metadata, txZilReq);
    const receipt = await txReq.sign(keypair);
    receipt.metadata.hash = uint8ArrayToHex(randomBytes(32), true);

    return receipt;
  };

  const createEvmTransactionReceipt = async (): Promise<TransactionReceipt> => {
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

    const ethTx = Transaction.prepare({
      to: await tokenAddress.toEthChecksum(),
      value: 0n,
      maxFeePerGas: weigwei.decode("1"),
      gasLimit: 24000n,
      maxPriorityFeePerGas: 10n,
      nonce: 0n,
      chainId: BigInt(BSC_CONFIG.chainId),
      data: transferData,
    });

    const metadata = {
      chainHash: BSC_CONFIG.hash(),
    };

    const txReq = new TransactionRequest(metadata, undefined, ethTx);
    const receipt = await txReq.sign(keypair);
    receipt.metadata.hash = uint8ArrayToHex(randomBytes(32), true);

    return receipt;
  };

  const createZilHistoricalTransaction = (): HistoricalTransaction => {
    return new HistoricalTransaction({
      transaction_hash:
        "ce924ea2d0dca2c76af0b8c7858d0401a95f6528122c8f3cd1da11d22b2bb01a",
      amount: 10000000000000n,
      sender: "0x1234567890123456789012345678901234567890",
      recipient: "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
      contract_address: null,
      status: TransactionStatus.Pending,
      status_code: null,
      timestamp: Math.floor(Date.now() / 1000) - 60,
      block_number: null,
      gasUsed: null,
      gasLimit: 50000n,
      gasPrice: 2000000000n,
      blobGasUsed: null,
      blobGasPrice: null,
      effectiveGasPrice: null,
      fee: 100000000000000n,
      icon: null,
      title: null,
      error: null,
      sig: "0x304402207fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0",
      nonce: 1n,
      token_info: null,
      chain_type: "Scilla",
      chain_hash: 1,
    });
  };

  const createEvmHistoricalTransaction = (): HistoricalTransaction => {
    return new HistoricalTransaction({
      transaction_hash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      amount: 1000000000000000000n,
      sender: "0x742d35Cc6634C0532925a3b8D6C9B5A6abc12345",
      recipient: "0x1234567890123456789012345678901234567890",
      contract_address: null,
      status: TransactionStatus.Pending,
      status_code: null,
      timestamp: Math.floor(Date.now() / 1000) - 60,
      block_number: null,
      gasUsed: null,
      gasLimit: 21000n,
      gasPrice: 20000000000n,
      blobGasUsed: null,
      blobGasPrice: null,
      effectiveGasPrice: null,
      fee: 420000000000000n,
      icon: null,
      title: null,
      error: null,
      sig: "0xf86c808504a817c800825208941234567890123456789012345678901234567890872386f26fc10000801ba0",
      nonce: 0n,
      token_info: null,
      chain_type: "EVM",
      chain_hash: 56,
    });
  };

  describe("buildSendSignedTxRequest", () => {
    it("should build request for Zilliqa transaction", async () => {
      const tx = await createZilTransactionReceipt();
      const request = buildSendSignedTxRequest(tx);

      expect(request.method).toBe(ZilMethods.CreateTransaction);
      expect(request.params).toHaveLength(1);
      expect(request.params[0]).toHaveProperty("version");
      expect(request.params[0]).toHaveProperty("nonce");
      expect(request.params[0]).toHaveProperty("amount");
    });

    it("should build request for EVM transaction", async () => {
      const tx = await createEvmTransactionReceipt();
      const request = buildSendSignedTxRequest(tx);

      expect(request.method).toBe(EvmMethods.SendRawTransaction);
      expect(request.params).toHaveLength(1);
      expect(typeof request.params[0]).toBe("string");
      expect(request.params[0]).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it("should throw error for invalid transaction type", () => {
      const invalidTx = new TransactionReceipt({ chainHash: 1 });
      expect(() => buildSendSignedTxRequest(invalidTx)).toThrow(
        "Invalid transaction type",
      );
    });
  });

  describe("buildPayloadTxReceipt", () => {
    it("should build request for Scilla transaction receipt", () => {
      const tx = createZilHistoricalTransaction();
      const request = buildPayloadTxReceipt(tx);

      expect(request.method).toBe(ZilMethods.GetTransactionStatus);
      expect(request.params).toEqual([tx.transaction_hash]);
    });

    it("should build request for EVM transaction receipt", () => {
      const tx = createEvmHistoricalTransaction();
      const request = buildPayloadTxReceipt(tx);

      expect(request.method).toBe(EvmMethods.GetTransactionReceipt);
      expect(request.params).toEqual([tx.transaction_hash]);
    });

    it("should throw error for invalid chain type", () => {
      const tx = createZilHistoricalTransaction();
      tx.chain_type = "Invalid" as any;
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
          ID: "1bb178b023f816e950d862f6505cd79a32bb97e71fd78441cbc3486940a2e1b7",
          _id: null,
          amount: "15000000000000",
          data: '{"_tag":"AddAccount","params":[{"vname":"address","type":"ByStr20","value":"0x0434cdcf27e2294b3539cb6ffe2cc328d7f9757e"},{"vname":"datetime_added","type":"String","value":"1607488428"}]}',
          epochInserted: "2152404",
          epochUpdated: "2152404",
          gasLimit: "75000",
          gasPrice: "3000000000",
          lastModified: "1607488477327083",
          modificationState: 1,
          status: 3,
          nonce: "2",
          senderAddr:
            "0x023cbc87c0f1f54ba4cfda17a4afc9edca5e074b8f2b5d63d6bfcd05f8c53f8455",
          signature:
            "0xbaa6964c66ae0608c6cefbaab69138e9358a1604c647dffef94e7022f2ab33d67f70802f71e934a0690be4ba81cc3866b2fb668b29c528e6b77b1285533a2e2c",
          success: true,
          toAddr: "0xdb4955ba4b1a957200ee0a36cf5f84eb4d7447e5",
          version: "21823489",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.amount).toBe(15000000000000n);
      expect(tx.gasLimit).toBe(75000n);
      expect(tx.gasPrice).toBe(3000000000n);
      expect(tx.nonce).toBe(2n);
      expect(tx.status).toBe(TransactionStatus.Success);
      expect(tx.status_code).toBe(3);
      expect(tx.fee).toBe(225000000000000n);
      expect(tx.sender).toBe("zil1p9knv9epazfxq9uyedfjr3xanj3nh29hztx97l");
    });

    it("should process pending Zilliqa transaction", async () => {
      const tx = createZilHistoricalTransaction();
      const response = {
        jsonrpc: "2.0",
        id: "1",
        result: {
          ID: "1bb178b023f816e950d862f6505cd79a32bb97e71fd78441cbc3486940a2e1b7",
          _id: null,
          amount: "10000000000000",
          data: "",
          epochInserted: "2152400",
          epochUpdated: "2152400",
          gasLimit: "50000",
          gasPrice: "2000000000",
          lastModified: "1607488400000000",
          modificationState: 1,
          status: 1,
          nonce: "1",
          senderAddr:
            "0x023cbc87c0f1f54ba4cfda17a4afc9edca5e074b8f2b5d63d6bfcd05f8c53f8455",
          signature:
            "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
          success: false,
          toAddr: "0xdb4955ba4b1a957200ee0a36cf5f84eb4d7447e5",
          version: "21823489",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Pending);
      expect(tx.status_code).toBe(1);
      expect(tx.amount).toBe(10000000000000n);
      expect(tx.gasLimit).toBe(50000n);
      expect(tx.gasPrice).toBe(2000000000n);
      expect(tx.nonce).toBe(1n);
      expect(tx.sender).toBe("zil1p9knv9epazfxq9uyedfjr3xanj3nh29hztx97l");
    });

    it("should process rejected Zilliqa transaction", async () => {
      const tx = createZilHistoricalTransaction();
      const response = {
        jsonrpc: "2.0",
        id: "1",
        result: {
          ID: "1bb178b023f816e950d862f6505cd79a32bb97e71fd78441cbc3486940a2e1b7",
          _id: null,
          amount: "10000000000000",
          data: "",
          epochInserted: "2152400",
          epochUpdated: "2152400",
          gasLimit: "50000",
          gasPrice: "2000000000",
          lastModified: "1607488400000000",
          modificationState: 2,
          status: 0,
          nonce: "1",
          senderAddr:
            "0x023cbc87c0f1f54ba4cfda17a4afc9edca5e074b8f2b5d63d6bfcd05f8c53f8455",
          signature:
            "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
          success: false,
          toAddr: "0xdb4955ba4b1a957200ee0a36cf5f84eb4d7447e5",
          version: "21823489",
          errorMsg: "INSUFFICIENT_BALANCE",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(0);
      expect(tx.amount).toBe(10000000000000n);
      expect(tx.gasLimit).toBe(50000n);
      expect(tx.gasPrice).toBe(2000000000n);
      expect(tx.nonce).toBe(1n);
      expect(tx.sender).toBe("zil1p9knv9epazfxq9uyedfjr3xanj3nh29hztx97l");
    });

    it("should handle standard length sender address", async () => {
      const tx = createZilHistoricalTransaction();
      const response = {
        jsonrpc: "2.0",
        id: "1",
        result: {
          ID: "1bb178b023f816e950d862f6505cd79a32bb97e71fd78441cbc3486940a2e1b7",
          amount: "10000000000000",
          gasLimit: "50000",
          gasPrice: "2000000000",
          nonce: "1",
          status: 3,
          senderAddr: "0xdb4955ba4b1a957200ee0a36cf5f84eb4d7447e5",
          toAddr: "0x1234567890123456789012345678901234567890",
          success: true,
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.sender).toBe("zil1me34whmtxs5duhhyu7vf02a0zvdtpdxj04uumr");
      expect(tx.status).toBe(TransactionStatus.Success);
    });

    it("should handle Zilliqa transaction timeout", async () => {
      const tx = createZilHistoricalTransaction();
      tx.timestamp = Math.floor(Date.now() / 1000) - 700;
      tx.status = TransactionStatus.Pending;

      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          status: 1,
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Failed);
      expect(tx.error).toBe("timeout");
    });

    it("should process successful EVM transaction receipt", async () => {
      const tx = createEvmHistoricalTransaction();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          blockHash:
            "0x1d59ff54b1eb26b013ce3cb5fc9dab3705b415a67127a003c3e61eb445bb8df2",
          blockNumber: "0x5daf3b",
          contractAddress: null,
          cumulativeGasUsed: "0x33bc",
          effectiveGasPrice: "0x174876e800",
          from: "0x742d35Cc6634C0532925a3b8D6C9B5A6abc12345",
          gasUsed: "0x5208",
          logs: [],
          status: "0x1",
          to: "0x1234567890123456789012345678901234567890",
          transactionHash:
            "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
          transactionIndex: "0x0",
          type: "0x0",
          blobGasUsed: "0x20000",
          blobGasPrice: "0x3b9aca00",
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.sender).toBe("0x742d35Cc6634C0532925a3b8D6C9B5A6abc12345");
      expect(tx.recipient).toBe("0x1234567890123456789012345678901234567890");
      expect(tx.block_number).toBe(0x5daf3bn);
      expect(tx.gasUsed).toBe(0x5208n);
      expect(tx.effectiveGasPrice).toBe(0x174876e800n);
      expect(tx.status).toBe(TransactionStatus.Success);
      expect(tx.blobGasUsed).toBe(0x20000n);
      expect(tx.blobGasPrice).toBe(0x3b9aca00n);
      expect(tx.fee).toBe(0x5208n * 0x174876e800n + 0x20000n * 0x3b9aca00n);
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
    });

    it("should handle RPC error response", async () => {
      const tx = createZilHistoricalTransaction();
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
      expect(tx.error).toBe("Transaction not found");
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

      processTxSendResponse(response, tx);

      expect(tx.metadata.hash).toBe(
        "ce924ea2d0dca2c76af0b8c7858d0401a95f6528122c8f3cd1da11d22b2bb01a",
      );
      expect(tx.metadata.info).toBe("Txn processed");
    });

    it("should process successful EVM transaction send", async () => {
      const tx = await createEvmTransactionReceipt();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result:
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      };

      processTxSendResponse(response, tx);

      expect(tx.metadata.hash).toBe(
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
        "Invalid transaction hash",
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
        "Invalid transaction hash",
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

  describe("Edge cases and error handling", () => {
    it("should handle malformed Zilliqa status codes", async () => {
      const tx = createZilHistoricalTransaction();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          status: 999,
        },
      };

      await processTxReceiptResponse(response, tx);

      expect(tx.status).toBe(TransactionStatus.Failed);
      expect(tx.status_code).toBe(999);
    });

    it("should handle missing optional fields in EVM receipt", async () => {
      const tx = createEvmHistoricalTransaction();
      const response = {
        id: 1,
        jsonrpc: "2.0",
        result: {
          status: "0x1",
          from: "0x742d35Cc6634C0532925a3b8D6C9B5A6abc12345",
          gasUsed: "0x5208",
          effectiveGasPrice: "0x174876e800",
        },
      };

      await processTxReceiptResponse(response, tx);
      expect(tx.status).toBe(TransactionStatus.Success);
      expect(tx.blobGasUsed).toBe(null);
      expect(tx.contract_address).toBe(null);
    });
  });
});
