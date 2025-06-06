export class FToken {
  name: string;
  symbol: string;
  decimals: number;
  addr: string;
  addrType: number;
  logo: string | null;
  balances: Record<number, string>;
  rate: number;
  default_: boolean;
  native: boolean;
  chainHash: number;

  constructor(data: {
    name: string;
    symbol: string;
    decimals: number;
    addr: string;
    addrType: number;
    logo?: string | null;
    balances: Record<number, string>;
    rate: number;
    default_: boolean;
    native: boolean;
    chainHash: number;
  }) {
    this.name = data.name;
    this.symbol = data.symbol;
    this.decimals = data.decimals;
    this.addr = data.addr;
    this.addrType = data.addrType;
    this.logo = data.logo ?? null;
    this.balances = data.balances;
    this.rate = data.rate;
    this.default_ = data.default_;
    this.native = data.native;
    this.chainHash = data.chainHash;
  }
}
