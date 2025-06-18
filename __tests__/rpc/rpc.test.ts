import { describe, it, expect } from "vitest";
import { createZilliqaConfig } from '../data';
import { NetworkProvider } from '../../background/rpc';
import { Address, AddressType } from "../../crypto/address";

describe("JsonRPC provder tests", () => {
  const zilConfig = createZilliqaConfig();

  it("should get ftoken metadata", async () => {
    const rpc = new NetworkProvider(zilConfig);
    const zlpContract = Address.fromStr("zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4");
    const result = await rpc.ftoken_meta(zlpContract, []);

    expect(result.addr).toBe(await zlpContract.toZilBech32());
    expect(result.addrType).toBe(AddressType.Bech32);
    expect(result.decimals).toBe(18);
    expect(result.symbol).toBe("ZLP");
    expect(result.name).toBe("ZilPay wallet");
  });
});

