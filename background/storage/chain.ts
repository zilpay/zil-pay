import { FToken } from './token';

export interface Explorer {
  name: string;
  url: string;
  icon: string;
  standard: string;
}

export class Chain {
  name: string;
  chain: string;
  logo: string;
  rpc: string[];
  features: string[];
  ftokens: FToken[];
  chainIds: number[];
  infoURL: string;
  shortName: string;
  slip44: number;
  explorers: Explorer[];
  networkId?: number;
  ens?: string;

  constructor(data: Record<string, unknown>) {
    this.name = (data.name as string);
    this.chain = (data.chain as string);
    this.logo = (data.logo as string);
    this.rpc = (data.rpc as string[]) ?? [];
    this.features = (data.features as string[]) ?? [];
    this.ftokens = (data.ftokens as FToken[]) ?? [];
    this.chainIds = (data.chainIds as number[]) ?? [];
    this.infoURL = (data.infoURL as string);
    this.shortName = (data.shortName as string);
    this.slip44 = data.slip44 as number;
    this.explorers = (data.explorers as Explorer[]) ?? [];
    this.networkId = data.networkId as number | undefined;
    this.ens = data.ens as string | undefined;
  }
}
