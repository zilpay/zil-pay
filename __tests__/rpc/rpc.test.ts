import { describe, it, expect } from "vitest";
import { createBscConfig, createEthConfig, createZilliqaConfig } from "../data";
import {
  generateErc20TransferData,
  NetworkProvider,
} from "../../background/rpc";
import { Address, AddressType } from "../../crypto/address";
import { Transaction, weieth, weigwei } from "micro-eth-signer";
import { TransactionRequest } from "../../crypto/tx";
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";
import {
  HistoricalTransaction,
  TransactionStatus,
} from "../../background/rpc/history_tx";
import { FToken } from "../../background/storage";
import { KeyPair } from "../../crypto/keypair";

describe("JsonRPC provder tests", () => {
  const zilConfig = createZilliqaConfig();
  const ethConfig = createEthConfig();
  const bscConfig = createBscConfig();

  it("should get scilla ftoken metadata", async () => {
    const rpc = new NetworkProvider(zilConfig);
    const zlpContract = Address.fromStr(
      "zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4",
    );
    const accounts = [
      Address.fromStr("zil1q9j4duzmxewzapj7j56ljfc6gggv3a9er8h766"),
      Address.fromStr("zil1q9l6zd560sdd4y9772k07fxee05wmj8hmg5lfz"),
      Address.fromStr("zil1qxja2utwtn0e3qdj8keauak7a3m5lugj9gryyw"),
      Address.fromStr("zil1qxn2qve0vs59cul2nl9ymjnsrc09mhuk8hzz3w"),
    ];
    const result = await rpc.ftokenMeta(zlpContract, accounts);

    expect(result.addr).toBe(await zlpContract.toZilBech32());
    expect(result.addrType).toBe(AddressType.Bech32);
    expect(result.decimals).toBe(18);
    expect(result.symbol).toBe("ZLP");
    expect(result.name).toBe("ZilPay wallet");

    accounts.forEach((_account, index) => {
      expect(result.balances[index]).toBeDefined();
      expect(BigInt(result.balances[index])).toBeGreaterThan(0);
    });
  });

  it("should get scilla ftoken metadata", async () => {
    const rpc = new NetworkProvider(ethConfig);
    const usdtContract = Address.fromStr(
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    );
    const accounts = [
      Address.fromStr("0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43"),
      Address.fromStr("0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"),
    ];
    const result = await rpc.ftokenMeta(usdtContract, accounts);

    expect(result.addr).toBe(await usdtContract.toEthChecksum());
    expect(result.addrType).toBe(AddressType.EthCheckSum);
    expect(result.decimals).toBe(6);
    expect(result.name).toBe("Tether USD");
    expect(result.symbol).toBe("USDT");

    accounts.forEach((_account, index) => {
      expect(result.balances[index]).toBeDefined();
      expect(BigInt(result.balances[index])).toBeGreaterThan(0);
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

    const fee = await provider.estimateParamsBatch(txRequest, from, 4, null);

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

    const fee = await provider.estimateParamsBatch(txRequest, from, 4, null);

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
    const fee = await provider.estimateParamsBatch(txRequest, from, 4, null);

    expect(fee.gasPrice).toBe(100000000n);
    expect(fee.nonce).toBeGreaterThan(0);
    expect(fee.maxPriorityFee).toBe(100000000n);
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
    const params = await provider.estimateParamsBatch(
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

  it("should estimate block time for EVM", async () => {
    const provider = new NetworkProvider(bscConfig);
    const blockTime = await provider.estimateBlockTime();
    expect(typeof blockTime).toBe("number");
    expect(blockTime).toBeGreaterThan(0);
    expect(blockTime).toBeLessThan(30);
  });

  it("should update multiple scilla transaction receipts", async () => {
    const provider = new NetworkProvider(zilConfig);
    const mockTxns = [
      new HistoricalTransaction({
        transaction_hash:
          "0xd0b318e0f5f9b1f1d03010b582488e6c0e463c94c315ec0cbeca839d0f3184e7",
        chain_hash: zilConfig.hash(),
        chain_type: "Scilla",
        amount: 0n,
        sender: "",
        recipient: "",
        status: TransactionStatus.Pending,
        timestamp: 0,
        fee: 0n,
        nonce: 0n,
        contract_address: null,
        status_code: null,
        block_number: null,
        gasUsed: null,
        gasLimit: null,
        gasPrice: null,
        blobGasUsed: null,
        blobGasPrice: null,
        effectiveGasPrice: null,
        icon: null,
        title: null,
        error: null,
        sig: "",
        token_info: null,
      }),
      new HistoricalTransaction({
        transaction_hash:
          "0x96830fa2fbd322d9731f4fd75b44d028a73a1323d7b52b099c6ae397ab4ccf43",
        chain_hash: zilConfig.hash(),
        chain_type: "Scilla",
        amount: 0n,
        sender: "",
        recipient: "",
        status: TransactionStatus.Pending,
        timestamp: 0,
        fee: 0n,
        nonce: 0n,
        contract_address: null,
        status_code: null,
        block_number: null,
        gasUsed: null,
        gasLimit: null,
        gasPrice: null,
        blobGasUsed: null,
        blobGasPrice: null,
        effectiveGasPrice: null,
        icon: null,
        title: null,
        error: null,
        sig: "",
        token_info: null,
      }),
    ];

    await provider.updateTransactionsReceipt(mockTxns);

    const [tx1, tx2] = mockTxns;

    expect(tx1.status).toBe(TransactionStatus.Success);
    expect(tx1.amount).toBe(348369130769230760n);
    expect(tx1.fee).toBe(100000000000n);
    expect(tx1.gasLimit).toBe(50n);
    expect(tx1.gasPrice).toBe(2000000000n);
    expect(tx1.nonce).toBe(1697n);
    expect(tx1.sender).toBe("zil1jl8qen2lutenrwdjla7kht3d4t4u47ywvnmkkw");

    expect(tx2.status).toBe(TransactionStatus.Success);
    expect(tx2.amount).toBe(0n);
    expect(tx2.fee).toBe(16000000000000n);
    expect(tx2.gasLimit).toBe(8000n);
    expect(tx2.gasPrice).toBe(2000000000n);
    expect(tx2.nonce).toBe(217n);
    expect(tx2.sender).toBe("zil1jmfl0ywaserpcxa3lu03e8nhestlay3p7fjm43");
  }, 20000);

  it("should update balances for multiple scilla tokens and accounts", async () => {
    const provider = new NetworkProvider(zilConfig);
    const accounts = [
      Address.fromStr("zil1xr07v36qa4zeagg4k5tm6ummht0jrwpcu0n55d"),
      Address.fromStr("zil163dwl9rs82gtq0h5gukrhhvefzqmn3d06vwsmr"),
      Address.fromStr("zil13gt2mjm2cq83mq3e30nwhdt9wl7elcwue094dz"),
    ];
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

    await provider.updateBalances(tokens, accounts);

    const addr0 = await accounts[0].autoFormat();
    const addr1 = await accounts[1].autoFormat();
    const addr2= await accounts[2].autoFormat();

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
    const accounts = [
      Address.fromStr("0x81014f44b0a345033bb2b3b21c7a1a308b35feea"),
      Address.fromStr("0x3ee18b2214aff97000d974cf647e7c347e8fa585"),
    ];
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

    await provider.updateBalances(tokens, accounts);

    const addr0 = await accounts[0].autoFormat();
    const addr1 = await accounts[1].autoFormat();

    expect(BigInt(tokens[0].balances[addr0])).toBeDefined();
    expect(BigInt(tokens[0].balances[addr1])).toBeDefined();

    expect(BigInt(tokens[1].balances[addr0])).toBeDefined();
    expect(BigInt(tokens[1].balances[addr1])).toBeDefined();
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
