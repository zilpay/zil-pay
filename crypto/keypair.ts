import type { TypedData } from "micro-eth-signer/typed-data.js";

import { ETHEREUM, ZILLIQA } from "config/slip44";
import { deriveFromPrivateKeyPublicKey, derivePrivateKey } from "./bip32";
import { DerivationPath } from "./bip49";
import { utils } from "aes-js";
import { sign, verify } from "./zilliqa/schnorr";
import {
  personal,
  signTyped,
  verifyTyped,
} from "micro-eth-signer/typed-data.js";
import { stripHexPrefix } from "lib/utils/hex";
import { Signature } from "@noble/secp256k1";
import { randomBytes } from "./random";
import { Address, AddressType } from "./address";

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

  async address(): Promise<Address> {
    return await Address.fromPubKey(this.pubKey, this.slip44);
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
    address: Address,
  ): Promise<boolean> {
    switch (this.addressType()) {
      case AddressType.EthCheckSum:
        const sigHex = `0x${utils.hex.fromBytes(signature)}`;
        const ethChecsumAddr = await address.toEthChecksum();

        return verifyTyped(sigHex, typedData, ethChecsumAddr);
      default:
        throw new Error("Unsupported");
    }
  }

  async verifySig(msg: Uint8Array, sig: Uint8Array): Promise<boolean> {
    switch (this.addressType()) {
      case AddressType.Bech32:
        return await verify(msg, this.pubKey, Signature.fromBytes(sig));
      case AddressType.EthCheckSum:
        const address = await this.address();
        const ethChecsum = await address.toEthChecksum();
        return personal.verify(utils.hex.fromBytes(sig), msg, ethChecsum);
    }
  }
}
