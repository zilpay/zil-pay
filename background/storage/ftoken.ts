import { type AddressType } from "crypto/address";

export interface IFTokenState {
  name: string;
  symbol: string;
  decimals: number;
  addr: string;
  addrType: AddressType;
  logo: string | null;
  balances: Record<string, string>;
  rate: number;
  default_: boolean;
  native: boolean;
  chainHash: number;
}

export class FToken implements IFTokenState {
  name: string;
  symbol: string;
  decimals: number;
  addr: string;
  addrType: AddressType;
  logo: string | null;
  balances: Record<string, string>;
  rate: number;
  default_: boolean;
  native: boolean;
  chainHash: number;

  constructor(data: IFTokenState) {
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

  toJSON(): IFTokenState {
    return {
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      addr: this.addr,
      addrType: this.addrType,
      logo: this.logo,
      balances: this.balances,
      rate: this.rate,
      default_: this.default_,
      native: this.native,
      chainHash: this.chainHash,
    };
  }
}
