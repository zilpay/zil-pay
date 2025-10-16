import { FToken, type IFTokenState } from './ftoken';
import { Explorer, type IExplorerState } from './explorer';
import { KeyPair } from 'crypto/keypair';
import { hashChainConfig } from 'lib/utils/hashing';
import { TypeOf } from 'lib/types';

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
  batchRequest: boolean;
  testnet: boolean | null;
  ftokens: IFTokenState[];
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
  batchRequest: boolean;
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
    this.diffBlockTime = data.diffBlockTime ?? 5;
    this.ens = data.ens ?? null;
    this.explorers = (data.explorers).map(
      (e) => new Explorer(e)
    );
    this.fallbackEnabled = TypeOf.isUndefined(data.fallbackEnabled) ? true : !!data.fallbackEnabled;
    this.batchRequest = TypeOf.isUndefined(data.batchRequest) ? true : !!data.batchRequest;
    this.testnet = data.testnet ?? null;
    this.ftokens = (data.ftokens).map(
      (t) => new FToken({
        ...t,
        default_: true,
        rate: 0,
        chainHash: t.chainHash ?? hashChainConfig(this.chainIds, this.slip44, this.chain),
        addrType: KeyPair.addressTypeFromAddress(t.addr),
        balances: t.balances ?? {},
      })
    );
  }

  hash(): number {
    return hashChainConfig(this.chainIds, this.slip44, this.chain);
  }

  toJSON(): IChainConfigState {
    return {
      name: this.name,
      logo: this.logo,
      chain: this.chain,
      shortName: this.shortName,
      rpc: this.rpc,
      features: this.features,
      chainId: this.chainId,
      chainIds: this.chainIds,
      slip44: this.slip44,
      diffBlockTime: this.diffBlockTime,
      ens: this.ens,
      explorers: this.explorers.map(e => e.toJSON()),
      fallbackEnabled: this.fallbackEnabled,
      batchRequest: this.batchRequest,
      testnet: this.testnet,
      ftokens: this.ftokens.map(t => t.toJSON())
    };
  }
}
