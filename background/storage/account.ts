import { derivePrivateKey } from '../../crypto/bip32';
import { DerivationPath } from '../../crypto/bip49';
import { AddressType } from './address-type';

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

  async fromBip39(bip32Account: Bip32Account, slip44: number, seed: Uint8Array) {
    const hdPath = new DerivationPath(slip44, bip32Account.index);
    const privateKey = await derivePrivateKey(seed, hdPath.getPath());

    const pubKey = '';
  }
}
