import { describe, it, expect } from "vitest";
import {
  HistoricalTransaction,
} from "../../background/rpc/history_tx";
import { generateErc20TransferData } from "../../background/rpc";
import { TransactionRequest } from "../../crypto/tx";
import { uint8ArrayToHex } from "../../lib/utils/hex";
import { utf8ToUint8Array } from "../../lib/utils/utf8";
import { Address } from "../../crypto/address";
import { KeyPair } from "../../crypto/keypair";
import { createBscConfig, createZilliqaConfig } from "../data";
import { Transaction, weieth, weigwei } from "micro-eth-signer";
import type { TransactionMetadata } from '../../types/tx';
import { TransactionStatus } from '../../config/tx';
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";

const ZIL_CONFIG = createZilliqaConfig();
const BSC_CONFIG = createBscConfig();

describe("HistoricalTransaction", () => {
  describe("Scilla Transactions", () => {
    it("should create HistoricalTransaction from Scilla SignedTransaction", async () => {
      const keypair = await KeyPair.generate(ZIL_CONFIG.slip44);
      const recipient = Address.fromStr(
        "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
      );
  
      const zilTx = new ZILTransactionRequest(
        ZIL_CONFIG.chainId,
        1697n,
        2000000000n,
        50n,
        recipient.bytes,
        348369130769230760n,
      );
  
      const metadata: TransactionMetadata = {
        chainHash: ZIL_CONFIG.hash(),
        token: {} as any,
      };
  
      const txReq = new TransactionRequest(metadata, zilTx);
      const signedTx = await txReq.sign(keypair);
  
      const mockHash = "0xd0b318e0f5f9b1f1d03010b582488e6c0e463c94c315ec0cbeca839d0f3184e7";
      const historicalTx = await HistoricalTransaction.fromSignedTransaction(
        signedTx,
        mockHash
      );

      expect(historicalTx.scilla).toBeDefined();
      expect(historicalTx.scilla!.hash).toBe(mockHash);
      expect(historicalTx.scilla!.nonce).toBe("1697");
      expect(historicalTx.scilla!.gasLimit).toBe("50");
      expect(historicalTx.scilla!.gasPrice).toBe("2000000000");
      expect(historicalTx.scilla!.amount).toBe("348369130769230760");
      expect(historicalTx.status).toBe(TransactionStatus.Pending);
    });
  });

  describe("EVM Transactions", () => {
    it("should create HistoricalTransaction from EVM legacy tx", async () => {
      const keypair = await KeyPair.generate(BSC_CONFIG.slip44);
      const tokenAddress = Address.fromStr(
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      );
      const recipient = Address.fromStr(
        "0xe33a784044d62147e6fc3a149f3debabf9a890f8",
      );
      const amount = 500886870n;
      const transferData = generateErc20TransferData(
        await recipient.toEthChecksum(),
        amount,
      );
  
      const ethTx = Transaction.prepare({
        to: await tokenAddress.toEthChecksum(),
        value: 0n,
        gasLimit: 127062n,
        gasPrice: 154087666n,
        nonce: 1621949n,
        chainId: 1n,
        data: transferData,
        type: 'legacy',
      }, false);
  
      const metadata: TransactionMetadata = {
        chainHash: BSC_CONFIG.hash(),
        token: {} as any,
      };
  
      const txReq = new TransactionRequest(metadata, undefined, ethTx);
      const signedTx = await txReq.sign(keypair);
  
      const mockHash = "0x1c38e47758ae1c69b8b339211261706fd16e93e1f84fecbd33b3b7cc9d1fefa1";
      const historicalTx = await HistoricalTransaction.fromSignedTransaction(
        signedTx,
        mockHash
      );

      expect(historicalTx.evm).toBeDefined();
      expect(historicalTx.evm!.transactionHash).toBe(mockHash);
      expect(historicalTx.evm!.type).toBe("legacy");
      expect(historicalTx.evm!.value).toBe("0");
      expect(historicalTx.evm!.gasLimit).toBe("127062");
      expect(historicalTx.evm!.gasPrice).toBe("154087666");
      expect(historicalTx.status).toBe(TransactionStatus.Pending);
    });

    it("should create HistoricalTransaction from EVM EIP-1559 tx", async () => {
      const keypair = await KeyPair.generate(BSC_CONFIG.slip44);
      const recipient = Address.fromStr(
        "0xe33a784044d62147e6fc3a149f3debabf9a890f8",
      );
  
      const ethTx = Transaction.prepare({
        to: await recipient.toEthChecksum(),
        value: weieth.decode("1"),
        gasLimit: 21000n,
        maxFeePerGas: weigwei.decode("30"),
        maxPriorityFeePerGas: weigwei.decode("2"),
        nonce: 0n,
        chainId: 1n,
        type: 'eip1559',
      });
  
      const metadata: TransactionMetadata = {
        chainHash: BSC_CONFIG.hash(),
        token: {} as any,
      };
  
      const txReq = new TransactionRequest(metadata, undefined, ethTx);
      const signedTx = await txReq.sign(keypair);
  
      const mockHash = "0xabcd...";
      const historicalTx = await HistoricalTransaction.fromSignedTransaction(
        signedTx,
        mockHash
      );

      expect(historicalTx.evm!.maxFeePerGas).toBeDefined();
      expect(historicalTx.evm!.maxPriorityFeePerGas).toBeDefined();
      expect(historicalTx.evm!.gasPrice).toBeUndefined();
    });
  });
});

