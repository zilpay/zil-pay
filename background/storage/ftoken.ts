import type { AddressType } from "crypto/keypair";

export class FToken {
  name: string;
  symbol: string;
  decimals: number;
  addr: string;
  addrType: AddressType;
  logo: string | null;
  balances: Record<number, string>;
  rate: number;
  default_: boolean;
  native: boolean;
  chainHash: number;

  constructor(data: Record<string, unknown>) {
    this.name = data.name as string;
    this.symbol = data.symbol as string;
    this.decimals = data.decimals as number;
    this.addr = data.addr as string;
    this.addrType = data.addrType as AddressType;
    this.logo = data.logo as string | null ?? null;
    this.balances = data.balances as Record<number, string>;
    this.rate = data.rate as number;
    this.default_ = data.default_ as boolean;
    this.native = data.native as boolean;
    this.chainHash = data.chainHash as number;
  }
}
