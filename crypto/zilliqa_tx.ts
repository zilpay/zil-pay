import { Signature } from "@noble/secp256k1";
import type { KeyPair } from "./keypair";
import {
  bigIntToUint8ArrayBigEndian,
  uint8ArrayToBigIntBigEndian,
} from "./number";
import {
  encodeProtoTransactionCoreInfo,
  type Long,
  type ProtoTransactionCoreInfo,
} from "./proto/zq1";
import { verify } from "./zilliqa/schnorr";
import { utils } from "aes-js";

const U128LEN = 16;

export function bigintToLong(value: bigint): Long {
  const low = Number(value & 0xffffffffn);
  const high = Number((value >> 32n) & 0xffffffffn);
  return { low, high, unsigned: true };
}

export function versionFromChainId(chainId: number): number {
  return (chainId << 16) | 1;
}

export function chainIdFromVersion(version: number): number {
  return (version >> 16) & 0xffff;
}

export class ZILTransactionRequest {
  constructor(
    public chainId: number,
    public nonce: bigint,
    public gasPrice: bigint,
    public gasLimit: bigint,
    public toAddr: Uint8Array,
    public amount: bigint,
    public code: Uint8Array = new Uint8Array(),
    public data: Uint8Array = new Uint8Array(),
  ) {}

  toProto(pubKey: Uint8Array): ProtoTransactionCoreInfo {
    return {
      version: versionFromChainId(this.chainId),
      nonce: bigintToLong(this.nonce),
      toaddr: this.toAddr,
      senderpubkey: { data: pubKey },
      amount: { data: bigIntToUint8ArrayBigEndian(this.amount, U128LEN) },
      gasprice: { data: bigIntToUint8ArrayBigEndian(this.gasPrice, U128LEN) },
      gaslimit: bigintToLong(this.gasLimit),
      code: this.code.length > 0 ? this.code : undefined,
      data: this.data.length > 0 ? this.data : undefined,
    };
  }

  encode(pubKey: Uint8Array): Uint8Array {
    const proto = this.toProto(pubKey);
    return encodeProtoTransactionCoreInfo(proto);
  }

  async sign(keypair: KeyPair) {
    const proto = this.toProto(keypair.pubKey);
    const bytes = encodeProtoTransactionCoreInfo(proto);
    const sig = await keypair.signMessage(bytes);

    return new ZILTransactionReceipt(
      proto.version ?? versionFromChainId(this.chainId),
      this.nonce,
      bigIntToUint8ArrayBigEndian(this.gasPrice, U128LEN),
      this.gasLimit,
      this.toAddr,
      bigIntToUint8ArrayBigEndian(this.amount, U128LEN),
      keypair.pubKey,
      this.code,
      this.data,
      sig,
      false,
    );
  }
}

export class ZILTransactionReceipt {
  constructor(
    public version: number,
    public nonce: bigint,
    public gasPrice: Uint8Array,
    public gasLimit: bigint,
    public toAddr: Uint8Array,
    public amount: Uint8Array,
    public pubKey: Uint8Array,
    public code: Uint8Array,
    public data: Uint8Array,
    public signature: Uint8Array,
    public priority: boolean,
  ) {}

  toProto(): ProtoTransactionCoreInfo {
    return {
      version: this.version,
      nonce: bigintToLong(this.nonce),
      toaddr: this.toAddr,
      senderpubkey: { data: this.pubKey },
      amount: { data: this.amount },
      gasprice: { data: this.gasPrice },
      gaslimit: bigintToLong(this.gasLimit),
      code: this.code.length > 0 ? this.code : undefined,
      data: this.data.length > 0 ? this.data : undefined,
    };
  }

  async verify(): Promise<boolean> {
    const proto = this.toProto();
    const bytes = encodeProtoTransactionCoreInfo(proto);
    const signature = Signature.fromBytes(this.signature);

    return verify(bytes, this.pubKey, signature);
  }

  toJSON() {
    return {
      version: this.version,
      nonce: this.nonce.toString(),
      toAddr: utils.hex.fromBytes(this.toAddr),
      amount: uint8ArrayToBigIntBigEndian(this.amount).toString(),
      pubKey: utils.hex.fromBytes(this.pubKey),
      gasPrice: uint8ArrayToBigIntBigEndian(this.gasPrice).toString(),
      gasLimit: this.gasLimit.toString(),
      code: this.code.length > 0 ? utils.utf8.fromBytes(this.code) : "",
      data: this.data.length > 0 ? utils.utf8.fromBytes(this.data) : "",
      signature: utils.hex.fromBytes(this.signature),
      priority: this.priority,
    };
  }
}
