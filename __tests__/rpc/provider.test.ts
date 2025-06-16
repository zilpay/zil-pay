import { describe, it, expect } from "vitest";
import { RpcProvider } from "../../background/rpc/provider";
import { fromBech32Address } from "../../lib/zilliqa";
import { EvmMethods, ZilMethods } from "../../config/jsonrpc";
import {
  createBscConfig,
  createEthConfig,
  createZilliqaConfig,
  ZERO_ADDR_BECH32,
  ZERO_ADDR_HEX,
} from "../data";

interface GetBalanceRes {
  balance: string;
  nonce: number;
}

interface ZilResultRes<T> {
  id: string;
  jsonrpc: string;
  result: T;
  error?: unknown;
}

interface EthResultRes<T> {
  id: number;
  jsonrpc: string;
  result: T;
  error?: unknown;
}

describe("RpcProvider", () => {
  it("test_build_payload", () => {
    const provider = new RpcProvider(createBscConfig());
    const payload = provider.buildPayload(EvmMethods.GetBalance, [
      "param1",
      "param2",
    ]);

    expect(payload.jsonrpc).toBe("2.0");
    expect(payload.id).toBe(1);
    expect(payload.method).toBe(EvmMethods.GetBalance);
    expect(Array.isArray(payload.params)).toBe(true);
    expect(payload.params[0]).toBe("param1");
    expect(payload.params[1]).toBe("param2");
  });

  it("test_get_balance_scilla", async () => {
    const address = await fromBech32Address(ZERO_ADDR_BECH32);
    const netConf = createZilliqaConfig();
    const zil = new RpcProvider(netConf);
    const payload = zil.buildPayload(ZilMethods.GetBalance, [
      address.replace("0x", "").toLowerCase(),
    ]);

    const res = await zil.req<ZilResultRes<GetBalanceRes>>(payload);

    expect(res.result).toBeDefined();
    expect(res.error).toBeUndefined();
    expect(res.result.balance).toBeDefined();
    expect(res.result.nonce).toBeDefined();
  }, 10000);

  it("test_get_balance_bsc", async () => {
    const netConf = createBscConfig();
    const bsc = new RpcProvider(netConf);
    const payload = bsc.buildPayload(EvmMethods.GetBalance, [
      ZERO_ADDR_HEX,
      "latest",
    ]);

    const res = await bsc.req<EthResultRes<string>>(payload);

    expect(res.result).toBeDefined();
    expect(res.error).toBeUndefined();
    expect(typeof res.result).toBe("string");
  }, 10000);

  it("test_network_much_req", async () => {
    const config = createEthConfig();
    const provider = new RpcProvider(config);
    const payload = provider.buildPayload(EvmMethods.GetBalance, [
      "0x246C5881E3F109B2aF170F5C773EF969d3da581B",
      "latest",
    ]);

    const result = await provider.req<EthResultRes<string>>(payload);

    expect(result.result).toBeDefined();
    expect(typeof result.result).toBe("string");
  }, 20000);

  it("test_batch_request", async () => {
    const netConf = createBscConfig();
    const bsc = new RpcProvider(netConf);
    const payloads = [
      bsc.buildPayload(EvmMethods.GetBalance, [ZERO_ADDR_HEX, "latest"]),
      bsc.buildPayload(EvmMethods.BlockNumber, []),
    ];

    const res =
      await bsc.req<[EthResultRes<string>, EthResultRes<string>]>(payloads);

    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBe(2);

    const balanceRes = res[0];
    expect(balanceRes.result).toBeDefined();
    expect(typeof balanceRes.result).toBe("string");

    const blockNumRes = res[1];
    expect(blockNumRes.result).toBeDefined();
    expect(typeof blockNumRes.result).toBe("string");
  }, 10000);

  it("should rotate nodes on failure and succeed on retry", async () => {
    const failingEthConfig = createEthConfig();
    const originalRpcOrder = [
      "https://invalid-rpc.io/1",
      "https://invalid-rpc.io/2",
      "https://invalid-rpc.io/3",
      ...failingEthConfig.rpc,
    ];
    failingEthConfig.rpc = [...originalRpcOrder];

    const provider = new RpcProvider(failingEthConfig);
    const payload = provider.buildPayload(EvmMethods.GetBalance, [
      ZERO_ADDR_HEX,
      "latest",
    ]);

    await expect(provider.req(payload)).rejects.toThrow();

    const expectedOrderAfterFailure = [
      ...originalRpcOrder.slice(3),
      ...originalRpcOrder.slice(0, 3),
    ];

    expect(provider.network.rpc).toEqual(expectedOrderAfterFailure);

    const result = await provider.req<EthResultRes<string>>(payload);

    expect(result.result).toBeDefined();
    expect(typeof result.result).toBe("string");
  }, 20000);
});
