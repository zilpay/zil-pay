import { FToken } from './ftoken';
import { Explorer } from './explorer';

export class ChainConfig {
  name: string;
  logo: string;
  chain: string;
  shortName: string;
  rpc: string[];
  features: number[];
  chainId: number;
  chainIds: BigUint64Array;
  slip44: number;
  diffBlockTime: number;
  chainHash: number;
  ens: string | null;
  explorers: Explorer[];
  fallbackEnabled: boolean;
  testnet: boolean | null;
  ftokens: FToken[];

  constructor(data: {
    name: string;
    logo: string;
    chain: string;
    shortName: string;
    rpc: string[];
    features: number[];
    chainId: number;
    chainIds: BigUint64Array;
    slip44: number;
    diffBlockTime: number;
    chainHash: number;
    ens?: string | null;
    explorers: Explorer[];
    fallbackEnabled: boolean;
    testnet?: boolean | null;
    ftokens: FToken[];
  }) {
    this.name = data.name;
    this.logo = data.logo;
    this.chain = data.chain;
    this.shortName = data.shortName;
    this.rpc = data.rpc;
    this.features = data.features;
    this.chainId = data.chainId;
    this.chainIds = data.chainIds;
    this.slip44 = data.slip44;
    this.diffBlockTime = data.diffBlockTime;
    this.chainHash = data.chainHash;
    this.ens = data.ens ?? null;
    this.explorers = data.explorers;
    this.fallbackEnabled = data.fallbackEnabled;
    this.testnet = data.testnet ?? null;
    this.ftokens = data.ftokens;
  }
}
