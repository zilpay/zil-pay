import type { TypedData } from "micro-eth-signer/typed-data.js";

import { ETHEREUM, ZILLIQA } from "config/slip44";
import { deriveFromPrivateKeyPublicKey, derivePrivateKey } from "./bip32";
import { DerivationPath } from "./bip49";
import { fromZilPubKey, toBech32Address } from "lib/zilliqa";
import { utils } from "aes-js";
import { addr } from "micro-eth-signer";
import { sign, verify } from "./zilliqa/schnorr";
import {
  personal,
  signTyped,
  verifyTyped,
} from "micro-eth-signer/typed-data.js";
import { stripHexPrefix } from "lib/utils/hex";
import { Signature } from "@noble/secp256k1";
import { randomBytes } from "./random";

export enum AddressType {
  Bech32,
  EthCheckSum,
}

export class KeyPair {
  #privateKey: Uint8Array;
  #pubKey: Uint8Array;
  #slip44: number;

  static addressType(slip44: number): AddressType {
    switch (slip44) {
      case ZILLIQA:
        return AddressType.Bech32;
      case ETHEREUM:
        return AddressType.EthCheckSum;
      default:
        return AddressType.EthCheckSum;
    }
  }

  static async fromPrivateKey(privateKey: Uint8Array, slip44: number) {
    const pubKey = await deriveFromPrivateKeyPublicKey(privateKey, slip44);

    return new KeyPair(privateKey, pubKey, slip44);
  }

  static async generate(slip44: number) {
    const privateKey = randomBytes(32);
    const pubKey = await deriveFromPrivateKeyPublicKey(privateKey, slip44);

    return new KeyPair(privateKey, pubKey, slip44);
  }

  static async fromSeed(seed: Uint8Array, slip44: number, index: number) {
    const hdPath = new DerivationPath(slip44, index);
    const privateKey = await derivePrivateKey(seed, hdPath.getPath());
    const pubKey = await deriveFromPrivateKeyPublicKey(privateKey, slip44);

    return new KeyPair(privateKey, pubKey, slip44);
  }

  get privateKey() {
    return this.#privateKey;
  }

  get pubKey() {
    return this.#pubKey;
  }

  get slip44() {
    return this.#slip44;
  }

  constructor(privateKey: Uint8Array, pubKey: Uint8Array, slip44: number) {
    this.#privateKey = privateKey;
    this.#pubKey = pubKey;
    this.#slip44 = slip44;
  }

  addressType(): AddressType {
    return KeyPair.addressType(this.#slip44);
  }

  async addrFromPubKey(): Promise<string> {
    switch (this.addressType()) {
      case AddressType.Bech32:
        const base16 = await fromZilPubKey(this.pubKey);
        return await toBech32Address(utils.hex.fromBytes(base16));
      case AddressType.EthCheckSum:
        return addr.fromPublicKey(this.pubKey);
    }
  }

  async signMessage(msg: Uint8Array) {
    switch (this.addressType()) {
      case AddressType.Bech32:
        const sigZil = await sign(msg, this.privateKey);
        return Uint8Array.from(sigZil.toBytes());
      case AddressType.EthCheckSum:
        const sigEth = personal.sign(msg, this.privateKey);
        return Uint8Array.from(utils.hex.toBytes(stripHexPrefix(sigEth)));
    }
  }

  signDataEIP712(typedData: TypedData<any, any>): Uint8Array {
    switch (this.addressType()) {
      case AddressType.EthCheckSum:
        const signature = signTyped(typedData, this.privateKey);
        return Uint8Array.from(utils.hex.toBytes(stripHexPrefix(signature)));
      default:
        throw new Error("Unsupported");
    }
  }

  async verifyTypedEIP712(
    signature: Uint8Array,
    typedData: TypedData<any, any>,
    address: string,
  ): Promise<boolean> {
    switch (this.addressType()) {
      case AddressType.EthCheckSum:
        const sigHex = `0x${utils.hex.fromBytes(signature)}`;
        return verifyTyped(sigHex, typedData, address);
      default:
        throw new Error("Unsupported");
    }
  }

  async verifySig(msg: Uint8Array, sig: Uint8Array): Promise<boolean> {
    switch (this.addressType()) {
      case AddressType.Bech32:
        return await verify(msg, this.pubKey, Signature.fromBytes(sig));
      case AddressType.EthCheckSum:
        const address = await this.addrFromPubKey();
        return personal.verify(utils.hex.fromBytes(sig), msg, address);
    }
  }
}
