import { FToken, type IFTokenState } from './ftoken';
import { Explorer, type IExplorerState } from './explorer';
import { KeyPair } from 'crypto/keypair';

export interface IChainConfigState {
  name: string;
  logo: string;
  chain: string;
  shortName: string;
  rpc: string[];
  features: number[];
  chainId: number;
  chainIds: number[];
  slip44: number;
  diffBlockTime: number;
  ens: string | null;
  explorers: IExplorerState[];
  fallbackEnabled: boolean;
  testnet: boolean | null;
  ftokens: IFTokenState[];
}

function hashNumber(hash: number, value: number): number {
  hash = (hash << 5) - hash + value;
  return hash >>> 0; 
}

function hashString(hash: number, str: string): number {
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash >>> 0; 
  }
  return hash;
}

function hashChainConfig(chainIds: number[], slip44: number, chain: string): number {
  let hash = 0;
  const chainIdsSum = chainIds[0] + chainIds[1];
  hash = hashNumber(hash, chainIdsSum);
  hash = hashNumber(hash, slip44);
  hash = hashString(hash, chain);
  return hash >>> 0;
}

export class ChainConfig implements IChainConfigState {
  name: string;
  logo: string;
  chain: string;
  shortName: string;
  rpc: string[];
  features: number[];
  chainId: number;
  chainIds: number[];
  slip44: number;
  diffBlockTime: number;
  ens: string | null;
  explorers: Explorer[];
  fallbackEnabled: boolean;
  testnet: boolean | null;
  ftokens: FToken[];

  constructor(data: IChainConfigState) {
    this.name = data.name;
    this.logo = data.logo;
    this.chain = data.chain;
    this.shortName = data.shortName;
    this.rpc = data.rpc;
    this.features = data.features;
    this.chainIds = data.chainIds;
    this.chainId = this.chainIds[0];
    this.slip44 = data.slip44;
    this.diffBlockTime = data.diffBlockTime;
    this.ens = data.ens ?? null;
    this.explorers = (data.explorers).map(
      (e) => new Explorer(e)
    );
    this.fallbackEnabled = data.fallbackEnabled;
    this.testnet = data.testnet ?? null;
    this.ftokens = (data.ftokens).map(
      (t) => new FToken({
        ...t,
        default_: true,
        rate: 0,
        chainHash: t.chainHash ?? hashChainConfig(this.chainIds, this.slip44, this.chain),
        addrType: KeyPair.addressType(this.slip44),
        balances: t.balances ?? {},
      })
    );
  }

  hash(): number {
    return hashChainConfig(this.chainIds, this.slip44, this.chain);
  }
}
