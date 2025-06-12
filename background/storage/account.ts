import { DerivationPath } from '../../crypto/bip49';
import { AddressType } from './address-type';

export interface Bip32Account {
  name: string;
  index: string;
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

  fromBip39(bip32Account: Bip32Account, slip44: number) {
    let hdPath = new DerivationPath(slip44, bip32Account.index);
  }
}
