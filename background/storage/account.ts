import { utils } from 'aes-js';
import { ChainConfig } from './chain';
import { KeyPair } from 'crypto/keypair';
import type { AddressType } from 'config/wallet';
import type { Bip32Account } from 'types/wallet';

export interface IAccountState {
  addr: string;
  addrType: AddressType;
  name: string;
  pubKey: string;
  chainHash: number;
  chainId: number;
  slip44: number;
  index: number;
}

export class Account implements IAccountState {
  addr: string;
  addrType: AddressType;
  name: string;
  pubKey: string;
  chainHash: number;
  chainId: number;
  slip44: number;
  index: number;

  constructor(data: IAccountState) {
    this.addr = data.addr;
    this.addrType = data.addrType;
    this.name = data.name;
    this.pubKey = data.pubKey;
    this.chainHash = data.chainHash;
    this.chainId = data.chainId;
    this.slip44 = data.slip44;
    this.index = data.index;
  }

  static async fromBip39(bip32Account: Bip32Account, chain: ChainConfig, seed: Uint8Array): Promise<Account> {
    const keyPair = await KeyPair.fromSeed(seed, chain.slip44, bip32Account.index);
    const addrType = keyPair.addressType();
    const addr = await (await keyPair.address()).autoFormat();
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
    const addr = await keyPair.address();
    const formated = await addr.autoFormat();

    const account = new Account({
      addrType,
      name: name,
      index: 0,
      addr: formated,
      pubKey: utils.hex.fromBytes(keyPair.pubKey),
      chainHash: chain.hash(),
      slip44: chain.slip44,
      chainId: chain.chainId,
    });

    return account;
  }

  toJSON(): IAccountState {
    return {
      addr: this.addr,
      addrType: this.addrType,
      name: this.name,
      pubKey: this.pubKey,
      chainHash: this.chainHash,
      chainId: this.chainId,
      slip44: this.slip44,
      index: this.index,
    };
  }
}
