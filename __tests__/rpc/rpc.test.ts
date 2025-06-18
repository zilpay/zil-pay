import { describe, it, expect } from "vitest";
import { createBscConfig, createEthConfig, createZilliqaConfig } from '../data';
import { generateErc20TransferData, NetworkProvider } from '../../background/rpc';
import { Address, AddressType } from "../../crypto/address";
import { Transaction } from "micro-eth-signer";
import { TransactionRequest } from '../../crypto/tx';
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";

describe("JsonRPC provder tests", () => {
  const zilConfig = createZilliqaConfig();
  const ethConfig = createEthConfig();
  const bscConfig = createBscConfig();

  it("should get scilla ftoken metadata", async () => {
    const rpc = new NetworkProvider(zilConfig);
    const zlpContract = Address.fromStr("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
    const accounts = [
      Address.fromStr("zil1q9j4duzmxewzapj7j56ljfc6gggv3a9er8h766"),
      Address.fromStr("zil1q9l6zd560sdd4y9772k07fxee05wmj8hmg5lfz"),
      Address.fromStr("zil1qxja2utwtn0e3qdj8keauak7a3m5lugj9gryyw"),
      Address.fromStr("zil1qxn2qve0vs59cul2nl9ymjnsrc09mhuk8hzz3w"),
    ];
    const result = await rpc.ftoken_meta(zlpContract, accounts);

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
    const usdtContract = Address.fromStr("0xdAC17F958D2ee523a2206206994597C13D831ec7");
    const accounts = [
      Address.fromStr("0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43"),
      Address.fromStr("0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"),
    ];
    const result = await rpc.ftoken_meta(usdtContract, accounts);

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

  // it("test_calc_fee_eth_batch", async () => {
  //   const provider = new NetworkProvider(ethConfig);
  //   const tokenAddress = Address.fromStr("0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc");
  //   const recipient = Address.fromStr("0x246C5881E3F109B2aF170F5C773EF969d3da581B");
  //   const from = Address.fromStr("0x451806FE45D9231eb1db3584494366edF05CB4AB");
  //   const amount = 100n;
  //   const transferData = generateErc20TransferData(await recipient.toEthChecksum(), amount);
  //   const ethTx = Transaction.prepare({
  //     to: await tokenAddress.toEthChecksum(),
  //     value: 0n,
  //     maxFeePerGas: 2000000000n,
  //     maxPriorityFeePerGas: 1000000000n,
  //     nonce: 0n,
  //     chainId: BigInt(ethConfig.chainId),
  //     data: transferData
  //   });
  //   const txRequest = new TransactionRequest({ chainHash: ethConfig.hash() }, undefined, ethTx);

  //   const fee = await provider.estimate_params_batch(txRequest, from, 4, null);

  //   expect(fee.gasPrice).toBeGreaterThan(0n);
  //   expect(fee.maxPriorityFee).toBeGreaterThan(0n);
  //   expect(fee.txEstimateGas).toBeGreaterThan(0n);
  //   expect(fee.feeHistory.maxFee).toBeGreaterThan(0n);
  //   expect(fee.feeHistory.priorityFee).toBeGreaterThan(0n);
  // }, 20000);

  // it("test_get_tx_params_payment", async () => {
  //   const provider = new NetworkProvider(ethConfig);
  //   const recipient = Address.fromStr("0x451806FE45D9231eb1db3584494366edF05CB4AB");
  //   const from = Address.fromStr("0x451806FE45D9231eb1db3584494366edF05CB4AB");
  //   const amount = 100n;
    
  //   const ethTx = Transaction.prepare({
  //     from: await from.toEthChecksum(),
  //     to: await recipient.toEthChecksum(),
  //     value: amount,
  //     type: 2,
  //     chainId: BigInt(ethConfig.chainId),
  //   });
  //   const txRequest = new TransactionRequest({ chainHash: ethConfig.hash() }, undefined, ethTx);

  //   const fee = await provider.estimate_params_batch(txRequest, from, 4, null);
    
  //   expect(fee.gasPrice).toBeGreaterThan(0n);
  //   expect(fee.maxPriorityFee).toBeGreaterThan(0n);
  //   expect(fee.txEstimateGas).toBe(21000n);
  //   expect(fee.feeHistory.maxFee).toBeGreaterThan(0n);
  //   expect(fee.feeHistory.priorityFee).toBeGreaterThan(0n);
  // }, 20000);

  // it("test_calc_fee_bsc_batch", async () => {
  //   const provider = new NetworkProvider(bscConfig);
  //   const recipient = Address.fromStr("0x246C5881E3F109B2aF170F5C773EF969d3da581B");
  //   const from = Address.fromStr("0x7b501c7944185130DD4aD73293e8Aa84eFfDcee7");
    
  //   const bscTx = Transaction.prepare({
  //     from: await from.toEthChecksum(),
  //     to: await recipient.toEthChecksum(),
  //     value: 0n,
  //     maxFeePerGas: 2000000000n,
  //     maxPriorityFeePerGas: 1000000000n,
  //     nonce: 0n,
  //   });

  //   const txRequest = new TransactionRequest({ chainHash: bscConfig.hash() }, undefined, bscTx);
  //   const fee = await provider.estimate_params_batch(txRequest, from, 4, null);
    
  //   expect(fee.gasPrice).toBeGreaterThan(0n);
  //   expect(fee.nonce).toBe(0);
  //   expect(fee.maxPriorityFee).toBeGreaterThan(0n);
  //   expect(fee.txEstimateGas).toBeGreaterThan(0n);
  // }, 20000);

  it("test_get_tx_prams_scilla", async () => {
    const provider = new NetworkProvider(zilConfig);
    const to = Address.fromStr("zil1xjj35ymsvf9ajqhprwh6pkvejm2lm2e9y4q4ev");
    const from = Address.fromStr("zil170u0aar9fjgu3hfma00wgk6axjl29l6hhnm2ua");
    
    const zilTx = new ZILTransactionRequest(
        zilConfig.chainId,
        1n,
        2000n * (10n ** 12n),
        100000n,
        to.bytes,
        10n ** 12n
    );
    const txRequest = new TransactionRequest({ chainHash: zilConfig.hash() }, zilTx, undefined);
    const params = await provider.estimate_params_batch(txRequest, from, 4, null);

    expect(params.gasPrice).toBeGreaterThan(0n);
    expect(params.nonce).toBeGreaterThan(0);
  }, 20000);
});

