import { addr as ethAddr } from 'micro-eth-signer';
import { fromBech32Address, fromZilPubKey, hasHexPrefix, toBech32Address, toChecksumBytesAddress } from "lib/zilliqa";
import { KeyPair } from "./keypair";
import { HRP } from 'lib/zilliqa/config';
import { utils } from "aes-js";

export enum AddressType {
  Bech32,
  EthCheckSum,
}

export class Address {
  readonly #bytes: Uint8Array;
  #type: AddressType;

  get bytes() {
    return this.#bytes;
  }

  get type() {
    return this.#type;
  }

  static async fromStr(address: string) {
    if (hasHexPrefix(address)) {
      const ethCheckSumAddress = ethAddr.parse(address);
      const bytes = utils.hex.toBytes(ethCheckSumAddress.data.replace("0x", ""));

      return new Address(bytes, AddressType.EthCheckSum);
    } else if (address.startsWith(HRP)) {
      const checkSumZil = await fromBech32Address(address);
      const bytes = utils.hex.toBytes(checkSumZil.replace("0x", ""));

      return new Address(bytes, AddressType.Bech32);
    }

    throw new Error('Unsupported address format');
  }

  static async fromPubKey(pubKey: Uint8Array, slip44: number) {
    const addressType = KeyPair.addressType(slip44);

    switch (addressType) {
      case AddressType.Bech32:
        const zilBytes = await fromZilPubKey(pubKey);

        return new Address(zilBytes, addressType);
      case AddressType.EthCheckSum:
        const ethChecsumAddress = ethAddr.fromPublicKey(pubKey);
        const ethBytes = utils.hex.toBytes(ethChecsumAddress.replace("0x", ""));

        return new Address(ethBytes, addressType);
    }
  }

  static async fromPrivateKey(privateKey: Uint8Array, slip44: number) {
    const keypair = await KeyPair.fromPrivateKey(privateKey, slip44);
    const addressType = keypair.addressType();

    switch (addressType) {
      case AddressType.Bech32:
        const base16 = await fromZilPubKey(keypair.pubKey);
        return new Address(base16, addressType);

      case AddressType.EthCheckSum:
        const ethChecsumAddress = ethAddr.fromPublicKey(keypair.pubKey);
        const ethBytes = utils.hex.toBytes(ethChecsumAddress.replace("0x", ""));

        return new Address(ethBytes, addressType);

    }
  }

  constructor(bytes: Uint8Array, type: AddressType) {
    this.#bytes = bytes;
    this.#type = type;
  }

  toBase16(): string {
    return utils.hex.fromBytes(this.bytes);
  }

  async toEthChecksum(): Promise<string> {
    const nonChecksummedAddress = `0x${this.toBase16()}`; 
    return ethAddr.addChecksum(nonChecksummedAddress);
  }

  async toZilChecksum(): Promise<string> {
    return toChecksumBytesAddress(this.bytes);
  }

  async toZilBech32(): Promise<string> {
    const zilChecSum = await this.toZilChecksum();

    return toBech32Address(zilChecSum);
  }
}
