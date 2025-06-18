import { describe, it, expect } from "vitest";
import { createEthConfig, createZilliqaConfig } from '../data';
import { NetworkProvider } from '../../background/rpc';
import { Address, AddressType } from "../../crypto/address";

describe("JsonRPC provder tests", () => {
  const zilConfig = createZilliqaConfig();
  const ethConfig = createEthConfig();

  it("should get scilla ftoken metadata", async () => {
    const rpc = new NetworkProvider(zilConfig);
    const zlpContract = Address.fromStr("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
    const result = await rpc.ftoken_meta(zlpContract, []);

    expect(result.addr).toBe(await zlpContract.toZilBech32());
    expect(result.addrType).toBe(AddressType.Bech32);
    expect(result.decimals).toBe(18);
    expect(result.symbol).toBe("ZLP");
    expect(result.name).toBe("ZilPay wallet");
  });

  it("should get scilla ftoken metadata", async () => {
    const rpc = new NetworkProvider(ethConfig);
    const usdtContract = Address.fromStr("0xdAC17F958D2ee523a2206206994597C13D831ec7");
    const result = await rpc.ftoken_meta(usdtContract, []);

    expect(result.addr).toBe(await usdtContract.toEthChecksum());
    expect(result.addrType).toBe(AddressType.EthCheckSum);
    expect(result.decimals).toBe(6);
    expect(result.name).toBe("Tether USD");
    expect(result.symbol).toBe("USDT");
  });
});

