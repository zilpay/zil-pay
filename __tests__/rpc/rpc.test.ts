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
    const result = await rpc.ftoken_meta(usdtContract, []);

    expect(result.addr).toBe(await usdtContract.toEthChecksum());
    expect(result.addrType).toBe(AddressType.EthCheckSum);
    expect(result.decimals).toBe(6);
    expect(result.name).toBe("Tether USD");
    expect(result.symbol).toBe("USDT");
  });
});

