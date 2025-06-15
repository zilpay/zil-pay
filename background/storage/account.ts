import { utils } from 'aes-js';
import { ChainConfig } from './chain';
import { AddressType, KeyPair } from 'crypto/keypair';

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

  static async fromBip39(bip32Account: Bip32Account, chain: ChainConfig, seed: Uint8Array): Promise<Account> {
    const keyPair = await KeyPair.fromSeed(seed, chain.slip44, bip32Account.index);
    const addrType = keyPair.addressType();
    const addr = await keyPair.addrFromPubKey();
    const account = new Account({
      addr,
      addrType,
      name: bip32Account.name,
      index: bip32Account.index,
      pubKey: utils.hex.fromBytes(keyPair.pubKey),
      chainHash: chain.hash(),
      slip44: chain.slip44,
      chainId: chain.chainId,
    });

    return account;
  }

  static async fromPrivateKey(privateKey: Uint8Array, chain: ChainConfig, name: string): Promise<Account> {
    const keyPair = await KeyPair.fromPrivateKey(privateKey, chain.slip44);
    const addrType = keyPair.addressType();
    const addr = await keyPair.addrFromPubKey();

    const account = new Account({
      addr,
      addrType,
      name: name,
      index: 0,
      pubKey: utils.hex.fromBytes(keyPair.pubKey),
      chainHash: chain.hash(),
      slip44: chain.slip44,
      chainId: chain.chainId,
    });

    return account;
  }
}
