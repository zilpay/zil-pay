import { utils } from 'aes-js';
import { deriveFromPrivateKeyPublicKey, derivePrivateKey } from '../../crypto/bip32';
import { DerivationPath } from '../../crypto/bip49';
import { AddressType } from './address-type';
import { ChainConfig } from './chain';
import { fromZilPubKey, toBech32Address } from '../../lib/zilliqa';
import { ETHEREUM, ZILLIQA } from '../../config/slip44';

export interface Bip32Account {
  name: string;
  index: number;
}

export class Account {
  addr: string;
  addrType: AddressType;
  name: string;
  pubKey: string;
  chainHash: number;
  chainId: number;
  slip44: number;
  index: number;

  constructor(data: Record<string, unknown>) {
    this.addr = data.addr as string;
    this.addrType = data.addrType as AddressType;
    this.name = data.name as string;
    this.pubKey = data.pubKey as string;
    this.chainHash = data.chainHash as number;
    this.chainId = data.chainId as number;
    this.slip44 = data.slip44 as number;
    this.index = data.index as number;
  }

  static async fromBip39(bip32Account: Bip32Account, chain: ChainConfig, seed: Uint8Array) {
    const hdPath = new DerivationPath(chain.slip44, bip32Account.index);
    const privateKey = await derivePrivateKey(seed, hdPath.getPath());
    const pubKey = await deriveFromPrivateKeyPublicKey(privateKey, chain.slip44);
    const addrType = (() => {
      switch (chain.slip44) {
        case ZILLIQA:
          return AddressType.Bech32;
        case ETHEREUM:
          return AddressType.EthCheckSum;
        default:
          return AddressType.EthCheckSum;
      }
    })();
    const addr = await (async () => {
      switch (chain.slip44) {
        case ZILLIQA:
          const base16 = await fromZilPubKey(pubKey);
          return await toBech32Address(utils.hex.fromBytes(base16));
        case ETHEREUM:
          throw new Error();
        default:
          throw new Error();
      }
    })();
    const account = new Account({
      addr,
      addrType,
      name: bip32Account.name,
      index: bip32Account.index,
      pubKey: utils.hex.fromBytes(pubKey),
      chainHash: chain.hash(),
      slip44: chain.slip44,
      chainId: chain.chainId,
    });

    return account;
  }
}
