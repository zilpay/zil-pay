import { FToken } from './ftoken';
import { Explorer } from './explorer';
import { ETHEREUM, ZILLIQA } from '../../config/slip44';
import { AddressType } from './address-type';
import { fromZilPubKey, toBech32Address } from '../../lib/zilliqa';
import { utils } from 'aes-js';

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
      (t) => new FToken(t)
    );
  }

  async addrFromPubKey(pubKey: Uint8Array) {
    switch (this.slip44) {
      case ZILLIQA:
        const base16 = await fromZilPubKey(pubKey);
        return await toBech32Address(utils.hex.fromBytes(base16));
      case ETHEREUM:
        throw new Error();
      default:
        throw new Error();
    }
  }

  addressType() {
    switch (this.slip44) {
      case ZILLIQA:
        return AddressType.Bech32;
      case ETHEREUM:
        return AddressType.EthCheckSum;
      default:
        return AddressType.EthCheckSum;
    }
  }

  hash(): number {
    let hash = 0;

    const chainIdsSum = this.chainIds[0] + this.chainIds[1];

    hash = this.#hashNumber(hash, chainIdsSum);
    hash = this.#hashNumber(hash, this.slip44);
    hash = this.#hashString(hash, this.chain);

    return hash;
  }

  #hashNumber(hash: number, value: number): number {
    hash = (hash << 5) - hash + value;
    return hash & 0xFFFFFFFF;
  }

  #hashString(hash: number, str: string): number {
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & 0xFFFFFFFF;
    }
    return hash;
  }
}
