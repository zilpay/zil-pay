import { describe, it, expect } from "vitest";
import { createBscConfig, createEthConfig, createZilliqaConfig } from "../data";
import {
  generateErc20TransferData,
  NetworkProvider,
} from "../../background/rpc";
import { Address } from "../../crypto/address";
import { Transaction, weieth, weigwei } from "micro-eth-signer";
import { TransactionRequest } from "../../crypto/tx";
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";
import {
  HistoricalTransaction,
} from "../../background/rpc/history_tx";
import { FToken } from "../../background/storage";
import { KeyPair } from "../../crypto/keypair";
import { hexToUint8Array } from "../../lib/utils/hex";
import { hashXOR } from "../../lib/utils/hashing";
import { TransactionStatus } from '../../config/tx';
import { AddressType } from "../../config/wallet";

const pubKeys = [
  hexToUint8Array("0229fff97d3823f556f151623053415a7e8207742928e08dafe400c3d4a02642fd"),
  hexToUint8Array("03d6928f1e0127643059a268a2fc48e9267f288465932c5540af3603239a31d33b"),
  hexToUint8Array("03d235424094b812fe31458be3805265fb3eece18d84c44deb606874d19b3557e7"),
];

describe("JsonRPC provder tests", () => {
  const zilConfig = createZilliqaConfig();
  const ethConfig = createEthConfig();
  const bscConfig = createBscConfig();

  it("should get scilla ftoken metadata", async () => {
    const rpc = new NetworkProvider(zilConfig);
    const zlpContract = Address.fromStr(
      "zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4",
    );
    const pubKeys = [
      hexToUint8Array("03b0194095e799a6a5f2e81a79fde0a927906c130520f050db263f0d9acbece1ba"),
    ];
    const result = await rpc.ftokenMeta(zlpContract, pubKeys);

    expect(result.addr).toBe(await zlpContract.toZilBech32());
    expect(result.addrType).toBe(AddressType.Bech32);
    expect(result.decimals).toBe(18);
    expect(result.symbol).toBe("ZLP");
    expect(result.name).toBe("ZilPay wallet");

    pubKeys.forEach((pubkey) => {
      expect(result.balances[hashXOR(pubkey)]).toBeDefined();
      expect(BigInt(result.balances[hashXOR(pubkey)])).toBeGreaterThan(0);
    });
  });

  it("should get scilla ftoken metadata", async () => {
    const rpc = new NetworkProvider(ethConfig);
    const usdtContract = Address.fromStr(
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    );
    const result = await rpc.ftokenMeta(usdtContract, pubKeys);

    expect(result.addr).toBe(await usdtContract.toEthChecksum());
    expect(result.addrType).toBe(AddressType.EthCheckSum);
    expect(result.decimals).toBe(6);
    expect(result.name).toBe("Tether USD");
    expect(result.symbol).toBe("USDT");

    pubKeys.forEach((pubKey) => {
      expect(result.balances[hashXOR(pubKey)]).toBeDefined();
    });
  });

  it("test_calc_fee_eth_batch", async () => {
    const provider = new NetworkProvider(ethConfig);
    const tokenAddress = Address.fromStr(
      "0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc",
    );
    const recipient = Address.fromStr(
      "0x246C5881E3F109B2aF170F5C773EF969d3da581B",
    );
    const from = Address.fromStr("0x451806FE45D9231eb1db3584494366edF05CB4AB");
    const amount = 100n;
    const transferData = generateErc20TransferData(
      await recipient.toEthChecksum(),
      amount,
    );
    const ethTx = Transaction.prepare({
      to: await tokenAddress.toEthChecksum(),
      value: 0n,
      maxFeePerGas: weigwei.decode("100"),
      nonce: 0n,
      chainId: BigInt(ethConfig.chainId),
      data: transferData,
    });
    const txRequest = new TransactionRequest(
      { chainHash: ethConfig.hash() },
      undefined,
      ethTx,
    );

    const fee = await provider.estimateGasParamsBatch(txRequest, from, 4, null);

    expect(fee.gasPrice).toBeGreaterThan(0n);
    expect(fee.nonce).toBeGreaterThan(0);
    expect(fee.maxPriorityFee).toBeGreaterThan(0n);
    expect(fee.txEstimateGas).toBe(22765n);
    expect(fee.blobBaseFee).toBe(0n);
    expect(fee.feeHistory.baseFee).toBeGreaterThan(0n);
    expect(fee.feeHistory.maxFee).toBeGreaterThan(0n);
    expect(fee.feeHistory.priorityFee).toBeGreaterThan(0n);
  }, 20000);

  it("test_get_tx_params_payment_eth", async () => {
    const provider = new NetworkProvider(ethConfig);
    const recipient = Address.fromStr(
      "0x451806FE45D9231eb1db3584494366edF05CB4AB",
    );
    const from = Address.fromStr("0x451806FE45D9231eb1db3584494366edF05CB4AB");
    const amount = 100n;

    const ethTx = Transaction.prepare({
      to: await recipient.toEthChecksum(),
      nonce: 0n,
      value: amount,
      chainId: BigInt(ethConfig.chainId),
      maxFeePerGas: weigwei.decode("100"),
    });
    const txRequest = new TransactionRequest(
      { chainHash: ethConfig.hash() },
      undefined,
      ethTx,
    );

    const fee = await provider.estimateGasParamsBatch(txRequest, from, 4, null);

    expect(fee.gasPrice).toBeGreaterThan(0n);
    expect(fee.nonce).toBeGreaterThan(0);
    expect(fee.maxPriorityFee).toBeGreaterThan(0n);
    expect(fee.txEstimateGas).toBe(21000n);
    expect(fee.blobBaseFee).toBe(0n);
    expect(fee.feeHistory.baseFee).toBeGreaterThan(0n);
    expect(fee.feeHistory.maxFee).toBeGreaterThan(0n);
    expect(fee.feeHistory.priorityFee).toBeGreaterThan(0n);
  }, 20000);

  it("test_calc_fee_bsc_batch", async () => {
    const provider = new NetworkProvider(bscConfig);
    const recipient = Address.fromStr(
      "0x246C5881E3F109B2aF170F5C773EF969d3da581B",
    );
    const from = Address.fromStr("0x7b501c7944185130DD4aD73293e8Aa84eFfDcee7");

    const bscTx = Transaction.prepare({
      to: await recipient.toEthChecksum(),
      value: weieth.decode("1.1"),
      maxFeePerGas: weigwei.decode("1"),
      nonce: 0n,
      chainId: BigInt(bscConfig.chainId),
    });

    const txRequest = new TransactionRequest(
      { chainHash: bscConfig.hash() },
      undefined,
      bscTx,
    );
    const fee = await provider.estimateGasParamsBatch(txRequest, from, 4, null);

    expect(fee.nonce).toBeGreaterThan(0);
    expect(fee.maxPriorityFee).toBeGreaterThan(1000n);
    expect(fee.txEstimateGas).toBe(21000n);
    expect(fee.blobBaseFee).toBe(0n);
    expect(fee.feeHistory.baseFee).toBe(0n);
    expect(fee.feeHistory.maxFee).toBeGreaterThanOrEqual(100n);
    expect(fee.feeHistory.priorityFee).toBeGreaterThan(1000000n);
  }, 20000);

  it("test_get_tx_prams_scilla", async () => {
    const provider = new NetworkProvider(zilConfig);
    const to = Address.fromStr("zil1xjj35ymsvf9ajqhprwh6pkvejm2lm2e9y4q4ev");
    const from = Address.fromStr("zil170u0aar9fjgu3hfma00wgk6axjl29l6hhnm2ua");

    const zilTx = new ZILTransactionRequest(
      zilConfig.chainId,
      1n,
      2000n * 10n ** 12n,
      100000n,
      to.bytes,
      10n ** 12n,
    );
    const txRequest = new TransactionRequest(
      { chainHash: zilConfig.hash() },
      zilTx,
      undefined,
    );
    const params = await provider.estimateGasParamsBatch(
      txRequest,
      from,
      4,
      null,
    );

    expect(params.gasPrice).toBeDefined();
    expect(params.nonce).toBeGreaterThan(0);
  }, 20000);

  it("should get current block number for EVM", async () => {
    const provider = new NetworkProvider(bscConfig);
    const blockNumber = await provider.getCurrentBlockNumber();
    expect(typeof blockNumber).toBe("bigint");
    expect(blockNumber).toBeGreaterThan(0n);
  });

  it("should get current block number for Scilla", async () => {
    const provider = new NetworkProvider(zilConfig);
    const blockNumber = await provider.getCurrentBlockNumber();
    expect(typeof blockNumber).toBe("bigint");
    expect(blockNumber).toBeGreaterThan(0n);
  });

  it("should update multiple scilla transaction receipts", async () => {
    const provider = new NetworkProvider(ethConfig);
    const mockTxns = [
      new HistoricalTransaction({
        status: TransactionStatus.Pending,
        metadata: {
          token: {
              balances: undefined,
          },
          chainHash: ethConfig.hash,
        },
        evm: {
          transactionHash: "0x1c38e47758ae1c69b8b339211261706fd16e93e1f84fecbd33b3b7cc9d1fefa1",
          from: "0x1c727a55ea3c11b0ab7d3a361fe0f3c47ce6de5d",
        },
        timestamp: new Date().getSeconds(),
      }),
      new HistoricalTransaction({
        status: TransactionStatus.Pending,
        metadata: {
          token: {
              balances: undefined,
          },
          chainHash: ethConfig.hash,
        },
        evm: {
          transactionHash: "0x08dafea60b7cdac9b9ff2dfb3660c652820347ded94fb470d1cd68f0fbc7704a",
          from: "0x6cab48ab9945f0cb10b20d1181bae37a56d8e3d2",
        },
        timestamp: new Date().getSeconds(),
      }),
    ];

    await provider.updateTransactionsHistory(mockTxns);

    expect(mockTxns[0].evm.blockHash).toBeDefined();
    expect(mockTxns[0].evm.blockNumber).toBeDefined();
    expect(mockTxns[0].evm.status).toBe('0x1');
    expect(mockTxns[0].evm.gasUsed).toBeDefined();
    expect(mockTxns[0].evm.logs).toBeDefined();
    expect(mockTxns[0].evm.logs?.length).toBeGreaterThan(0);

    expect(mockTxns[1].evm.blockHash).toBeDefined();
    expect(mockTxns[1].evm.blockNumber).toBeDefined();
    expect(mockTxns[1].evm.status).toBe('0x1');
    expect(mockTxns[1].evm.gasUsed).toBeDefined();
    expect(mockTxns[1].evm.logs).toBeDefined();
    expect(mockTxns[1].evm.logs?.length).toBeGreaterThan(0);

    expect(mockTxns[0].scilla).toBeUndefined();
    expect(mockTxns[1].scilla).toBeUndefined();
  }, 20000);

  it("should update balances for multiple scilla tokens and accounts", async () => {
    const provider = new NetworkProvider(zilConfig);
    const tokens = [
      new FToken({
        native: true,
        addr: "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz",
        name: "Zilliqa",
        symbol: "ZIL",
        decimals: 12,
        addrType: AddressType.Bech32,
        balances: {},
        chainHash: zilConfig.hash(),
        default_: true,
        logo: null,
        rate: 0,
      }),
      new FToken({
        native: false,
        addr: "zil1sxx29cshups269ahh5qjffyr58mxjv9ft78jqy",
        name: "Zilliqa-bridged USDT token",
        symbol: "zUSDT",
        decimals: 6,
        addrType: AddressType.Bech32,
        balances: {},
        chainHash: zilConfig.hash(),
        default_: false,
        logo: null,
        rate: 0,
      }),
      new FToken({
        native: false,
        addr: "zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4",
        name: "ZilPay Wallet",
        symbol: "ZLP",
        decimals: 18,
        addrType: AddressType.Bech32,
        balances: {},
        chainHash: zilConfig.hash(),
        default_: false,
        logo: null,
        rate: 0,
      }),
    ];

    await provider.updateBalances(tokens, pubKeys);

    const addr0 = hashXOR(pubKeys[0]);
    const addr1 = hashXOR( pubKeys[1]);
    const addr2= hashXOR(pubKeys[2]);

    expect(BigInt(tokens[0].balances[addr0])).toBeDefined();
    expect(BigInt(tokens[0].balances[addr1])).toBeDefined();
    expect(BigInt(tokens[0].balances[addr2])).toBeDefined();

    expect(BigInt(tokens[1].balances[addr0])).toBeDefined();
    expect(BigInt(tokens[1].balances[addr1])).toBeDefined();
    expect(BigInt(tokens[1].balances[addr2])).toBeDefined();

    expect(BigInt(tokens[2].balances[addr0])).toBeDefined();
    expect(BigInt(tokens[2].balances[addr1])).toBeDefined();
    expect(BigInt(tokens[2].balances[addr2])).toBeDefined();
  }, 20000);

  it("should update balances for multiple EVM tokens and accounts", async () => {
    const provider = new NetworkProvider(ethConfig);
    const tokens = [
      new FToken({
        native: true,
        addr: "0x0000000000000000000000000000000000000000",
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        addrType: AddressType.EthCheckSum,
        balances: {},
        chainHash: ethConfig.hash(),
        default_: true,
        logo: null,
        rate: 0,
      }),
      new FToken({
        native: false,
        addr: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        name: "Wrapped BTC",
        symbol: "WBTC",
        decimals: 8,
        addrType: AddressType.EthCheckSum,
        balances: {},
        chainHash: ethConfig.hash(),
        default_: false,
        logo: null,
        rate: 0,
      }),
    ];

    await provider.updateBalances(tokens, pubKeys);

    const hash0 = hashXOR(pubKeys[0]);
    const hash1 = hashXOR(pubKeys[1]);

    expect(BigInt(tokens[0].balances[hash0])).toBeDefined();
    expect(BigInt(tokens[0].balances[hash1])).toBeDefined();

    expect(BigInt(tokens[1].balances[hash0])).toBeDefined();
    expect(BigInt(tokens[1].balances[hash1])).toBeDefined();
  }, 20000);

  it("should broadcast a signed EVM transaction and fail", async () => {
    const provider = new NetworkProvider(ethConfig);
    const keypair = await KeyPair.generate(ethConfig.slip44);
    const recipient = Address.fromStr(
      "0x451806FE45D9231eb1db3584494366edF05CB4AB",
    );

    const ethTx = Transaction.prepare({
      to: await recipient.toEthChecksum(),
      nonce: 0n,
      value: 1n,
      chainId: BigInt(ethConfig.chainId),
      maxFeePerGas: weigwei.decode("100"),
    });

    const txRequest = new TransactionRequest(
      { chainHash: ethConfig.hash() },
      undefined,
      ethTx,
    );

    const signedTx = await txRequest.sign(keypair);

    await expect(
      provider.broadcastSignedTransactions([signedTx]),
    ).rejects.toThrow(/insufficient funds|nonce too low/);
  }, 20000);

  it("should broadcast a signed Scilla transaction", async () => {
    const provider = new NetworkProvider(zilConfig);
    const keypair = await KeyPair.generate(zilConfig.slip44);
    const recipient = Address.fromStr(
      "zil1xjj35ymsvf9ajqhprwh6pkvejm2lm2e9y4q4ev",
    );

    const zilTx = new ZILTransactionRequest(
      zilConfig.chainId,
      0n,
      2000000000n,
      50n,
      recipient.bytes,
      1000000n,
    );
    const txRequest = new TransactionRequest(
      { chainHash: zilConfig.hash() },
      zilTx,
    );
    const signedTx = await txRequest.sign(keypair);

    await expect(
      provider.broadcastSignedTransactions([signedTx]),
    ).rejects.toThrow("Invalid nonce (0)");
  }, 20000);
});

