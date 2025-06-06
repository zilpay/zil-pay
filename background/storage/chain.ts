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

  constructor(data: Record<string, unknown>) {
    this.name = data.name as string;
    this.logo = data.logo as string;
    this.chain = data.chain as string;
    this.shortName = data.shortName as string;
    this.rpc = data.rpc as string[];
    this.features = data.features as number[];
    this.chainId = data.chainId as number;
    this.chainIds = data.chainIds as BigUint64Array;
    this.slip44 = data.slip44 as number;
    this.diffBlockTime = data.diffBlockTime as number;
    this.chainHash = data.chainHash as number;
    this.ens = data.ens as string | null ?? null;
    this.explorers = (data.explorers as Record<string, unknown>[]).map(
      (e) => new Explorer(e)
    );
    this.fallbackEnabled = data.fallbackEnabled as boolean;
    this.testnet = data.testnet as boolean | null ?? null;
    this.ftokens = (data.ftokens as Record<string, unknown>[]).map(
      (t) => new FToken(t)
    );
  }
}
