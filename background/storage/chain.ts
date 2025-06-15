import { FToken } from './ftoken';
import { Explorer } from './explorer';
import { KeyPair } from 'crypto/keypair';

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

export class ChainConfig {
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

  constructor(data: Record<string, unknown>) {
    this.name = data.name as string;
    this.logo = data.logo as string;
    this.chain = data.chain as string;
    this.shortName = data.shortName as string;
    this.rpc = data.rpc as string[];
    this.features = data.features as number[];
    this.chainIds = data.chainIds as number[];
    this.chainId = this.chainIds[0];
    this.slip44 = data.slip44 as number;
    this.diffBlockTime = data.diffBlockTime as number;
    this.ens = data.ens as string | null ?? null;
    this.explorers = (data.explorers as Record<string, unknown>[]).map(
      (e) => new Explorer(e)
    );
    this.fallbackEnabled = data.fallbackEnabled as boolean;
    this.testnet = data.testnet as boolean | null ?? null;
    this.ftokens = (data.ftokens as Record<string, unknown>[]).map(
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
