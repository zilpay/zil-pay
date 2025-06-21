import { describe, it, expect } from "vitest";
import {
  HistoricalTransaction,
  TransactionStatus,
  ChainType,
} from "../../background/rpc/history_tx";
import { generateErc20TransferData } from "../../background/rpc";
import { TransactionRequest } from "../../crypto/tx";
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";
import { uint8ArrayToHex } from "../../lib/utils/hex";
import { utf8ToUint8Array } from "../../lib/utils/utf8";
import { Address } from "../../crypto/address";
import { KeyPair } from "../../crypto/keypair";
import { createBscConfig, createZilliqaConfig } from "../data";
import { randomBytes } from "../../crypto/random";
import { Transaction, weieth, weigwei } from "micro-eth-signer";

const ZIL_CONFIG = createZilliqaConfig();
const BSC_CONFIG = createBscConfig();

describe("HistoricalTransaction", () => {
  describe("fromReceipt", () => {
    describe("Scilla Transactions", () => {
      it("should be props a Scilla contract call", async () => {
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

        receipt.metadata.hash = uint8ArrayToHex(randomBytes(64), true);

        const historicalTx = await HistoricalTransaction.fromReceipt(receipt);

        expect(historicalTx.data).toBe(data);
        expect(historicalTx.code).toBe("");
        expect(historicalTx).toBeInstanceOf(HistoricalTransaction);
        expect(historicalTx.transaction_hash).toBeDefined();
        expect(historicalTx.amount).toBe(1000000000000n);
        expect(historicalTx.sender).toEqual(uint8ArrayToHex(keypair.pubKey));
        expect(historicalTx.recipient).toBe(
          "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
        );
        expect(historicalTx.contract_address).toBe(
          "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
        );
        expect(historicalTx.status).toBe(TransactionStatus.Pending);
        expect(historicalTx.status_code).toBeNull();
        expect(historicalTx.timestamp).toBeDefined();
        expect(historicalTx.block_number).toBeNull();
        expect(historicalTx.gasUsed).toBeNull();
        expect(historicalTx.gasLimit).toBe(100000n);
        expect(historicalTx.gasPrice).toBe(2000000000n);
        expect(historicalTx.effectiveGasPrice).toBeNull();
        expect(historicalTx.fee).toBe(200000000000000n);
        expect(historicalTx.icon).toBeNull();
        expect(historicalTx.title).toBeNull();
        expect(historicalTx.error).toBeNull();
        expect(historicalTx.sig).toBeDefined();
        expect(historicalTx.nonce).toBe(1n);
        expect(historicalTx.token_info).toBeNull();
        expect(historicalTx.chain_type).toBe("Scilla" as ChainType);
        expect(historicalTx.chain_hash).toBe(ZIL_CONFIG.hash());
      });
    });

    describe("EVM Transactions", () => {
      it("should have props an EVM contract call", async () => {
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

        receipt.metadata.hash = uint8ArrayToHex(randomBytes(64), true);

        const historicalTx = await HistoricalTransaction.fromReceipt(receipt);
        expect(historicalTx.transaction_hash).toEqual(expect.any(String));
        expect(historicalTx.amount).toBe(0n);
        expect(historicalTx.sender).toBe(
          await keypair.address().then((a) => a.toEthChecksum()),
        );
        expect(historicalTx.recipient).toBe(await tokenAddress.toEthChecksum());
        expect(historicalTx.contract_address).toBe(
          await tokenAddress.toEthChecksum(),
        );
        expect(historicalTx.status).toBe(TransactionStatus.Pending);
        expect(historicalTx.status_code).toBeNull();
        expect(historicalTx.timestamp).toBeDefined();
        expect(historicalTx.block_number).toBeNull();
        expect(historicalTx.sig).toBeDefined();
        expect(historicalTx.gasUsed).toBeNull();
        expect(historicalTx.gasLimit).toBe(24000n);
        expect(historicalTx.gasPrice).toBeNull();
        expect(historicalTx.effectiveGasPrice).toBe(10n);
        expect(historicalTx.fee).toBe(24000000000000n);
        expect(historicalTx.icon).toBeNull();
        expect(historicalTx.title).toBeNull();
        expect(historicalTx.error).toBeNull();
        expect(historicalTx.sig).toEqual(expect.any(String));
        expect(historicalTx.nonce).toBe(0n);
        expect(historicalTx.token_info).toBeNull();
        expect(historicalTx.chain_type).toBe("EVM" as ChainType);
        expect(historicalTx.chain_hash).toBe(BSC_CONFIG.hash());
      });
    });
  });
});

describe("toJSON", () => {
  it("should convert Scilla transaction to JSON correctly", async () => {
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
      tokenInfo: ["1000000000000", 12, "ZIL"] as [string, number, string],
    };
    const txReq = new TransactionRequest(metadata, txZilReq);
    const receipt = await txReq.sign(keypair);

    receipt.metadata.hash = uint8ArrayToHex(randomBytes(64), true);

    const historicalTx = await HistoricalTransaction.fromReceipt(receipt);
    const json = historicalTx.toJSON();

    expect(json).toEqual({
      transaction_hash: historicalTx.transaction_hash,
      amount: "1000000000000",
      sender: uint8ArrayToHex(keypair.pubKey),
      recipient: "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
      contract_address: "zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw",
      status: "Pending",
      status_code: null,
      timestamp: expect.any(Number),
      block_number: null,
      gasUsed: null,
      gasLimit: "100000",
      gasPrice: "2000000000",
      blobGasUsed: null,
      blobGasPrice: null,
      effectiveGasPrice: null,
      fee: "200000000000000",
      icon: null,
      title: null,
      error: null,
      sig: expect.any(String),
      nonce: "1",
      token_info: {
        value: "1000000000000",
        decimals: 12,
        symbol: "ZIL",
      },
      chain_type: "Scilla",
      chain_hash: ZIL_CONFIG.hash(),
      data: data,
      code: "",
    });
  });

  it("should convert EVM transaction to JSON correctly", async () => {
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
      tokenInfo: ["69000000000000000000", 18, "USDT"] as [string, number, string],
    };
    const txReq = new TransactionRequest(metadata, undefined, ethTx);
    const receipt = await txReq.sign(keypair);

    receipt.metadata.hash = uint8ArrayToHex(randomBytes(64), true);

    const historicalTx = await HistoricalTransaction.fromReceipt(receipt);
    const json = historicalTx.toJSON();

    expect(json).toEqual({
      transaction_hash: historicalTx.transaction_hash,
      amount: "0",
      sender: await keypair.address().then((a) => a.toEthChecksum()),
      recipient: await tokenAddress.toEthChecksum(),
      contract_address: await tokenAddress.toEthChecksum(),
      status: "Pending",
      status_code: null,
      timestamp: expect.any(Number),
      block_number: null,
      gasUsed: null,
      gasLimit: "24000",
      gasPrice: null,
      blobGasUsed: null,
      blobGasPrice: null,
      effectiveGasPrice: "10",
      fee: "24000000000000",
      icon: null,
      title: null,
      error: null,
      sig: expect.any(String),
      nonce: "0",
      token_info: {
        value: "69000000000000000000",
        decimals: 18,
        symbol: "USDT",
      },
      chain_type: "EVM",
      chain_hash: BSC_CONFIG.hash(),
      data: transferData,
      code: undefined,
    });
  });
});
