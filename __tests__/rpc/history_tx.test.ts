import { describe, it, expect } from "vitest";
import {
  HistoricalTransaction,
} from "../../background/rpc/history_tx";
import { generateErc20TransferData } from "../../background/rpc";
import { TransactionRequest } from "../../crypto/tx";
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
    const mockResult = {
      ID: "1878b575d736e88827c926f0251a13d639f605edb75ef916ab278485d96f1125",
      version: "65537",
      nonce: "1274",
      toAddr: "6eaf9b37f9870994f5853eb28405919f87e8dec2",
      senderPubKey: "0x02f006b10b35ed60ac7cb79866b228a048b7d820561ec917b1ad3d2e5a851cedb9",
      amount: "0",
      signature: "0x9bc96ba0baba5a34cf6e4de6218ff7a7809763f6324912dff1c546ce0295e47b41bfb7eda6b6034eeeed69077088253e9d55eeb85dc77829c774fe45894d2eef",
      receipt: {
        accepted: false,
        gas_used: "1843",
        cumulative_gas_used: "1843",
        cumulative_gas: "1843",
        epoch_num: "10915779",
        transitions: [],
        event_logs: [],
        errors: { "0": [7] },
        exceptions: [
          {
            line: 175,
            message: "Exception thrown: (Message [(_exception : (String \"Error\")) ; (code : (Int32 -10))])"
          }
        ],
        success: false
      },
      gasPrice: "2000000016",
      gasLimit: "5000",
      code: null,
      data: "{\"_tag\":\"CallRewards\",\"params\":[{\"vname\":\"token_id\",\"type\":\"Uint256\",\"value\":\"1892\"}]}"
    };

    it("should create HistoricalTransaction from Scilla SignedTransaction", async () => {
      const keypair = await KeyPair.generate(ZIL_CONFIG.slip44);
      const recipient = Address.fromStr(
        "zil1d6hekdlesuyefav986eggpv3n7r73hkzcnpdjm",
      );
  
      const zilTx = new ZILTransactionRequest(
        ZIL_CONFIG.chainId,
        1274n,
        2000000016n,
        5000n,
        recipient.bytes,
        0n,
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
      expect(historicalTx.scilla!.nonce).toBe("1274");
      expect(historicalTx.scilla!.gasLimit).toBe("5000");
      expect(historicalTx.scilla!.gasPrice).toBe("2000000016");
      expect(historicalTx.scilla!.amount).toBe("0");
      expect(historicalTx.status).toBe(TransactionStatus.Pending);

      await historicalTx.updateFromJsonRPCResult(mockResult);

      expect(historicalTx.status).toBe(TransactionStatus.Failed);
      expect(historicalTx.scilla).toBeDefined();
      expect(historicalTx.scilla!.hash).toBe("1878b575d736e88827c926f0251a13d639f605edb75ef916ab278485d96f1125");
      expect(historicalTx.scilla!.version).toBe("65537");
      expect(historicalTx.scilla!.nonce).toBe("1274");
      expect(historicalTx.scilla!.toAddr).toBe("6eaf9b37f9870994f5853eb28405919f87e8dec2");
      expect(historicalTx.scilla!.senderPubKey).toBe("0x02f006b10b35ed60ac7cb79866b228a048b7d820561ec917b1ad3d2e5a851cedb9");
      expect(historicalTx.scilla!.amount).toBe("0");
      expect(historicalTx.scilla!.signature).toBe("0x9bc96ba0baba5a34cf6e4de6218ff7a7809763f6324912dff1c546ce0295e47b41bfb7eda6b6034eeeed69077088253e9d55eeb85dc77829c774fe45894d2eef");
      expect(historicalTx.scilla!.gasPrice).toBe("2000000016");
      expect(historicalTx.scilla!.gasLimit).toBe("5000");
      expect(historicalTx.scilla!.data).toBe("{\"_tag\":\"CallRewards\",\"params\":[{\"vname\":\"token_id\",\"type\":\"Uint256\",\"value\":\"1892\"}]}");
      expect(historicalTx.scilla!.code).toBe("");
      expect(historicalTx.scilla!.senderAddr).toBe("zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace");
      expect(historicalTx.scilla!.chainId).toBe(1);
      expect(historicalTx.scilla!.receipt).toBeDefined();
      expect(historicalTx.scilla!.receipt!.success).toBe(false);
      expect(historicalTx.scilla!.receipt!.accepted).toBe(false);
      expect(historicalTx.scilla!.receipt!.gas_used).toBe("1843");
      expect(historicalTx.scilla!.receipt!.epoch_num).toBe("10915779");
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

