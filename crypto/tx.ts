import { ZILTransactionRequest, ZILTransactionReceipt } from "./zilliqa_tx";
import { Transaction } from "micro-eth-signer";
import { KeyPair } from "./keypair";
import { randomBytes } from "./random";
import { bigintToHex, HEX_PREFIX, hexToUint8Array } from "lib/utils/hex";
import type { TransactionMetadata, TransactionRequestEVM } from "types/tx";
import type { TxType } from "micro-eth-signer/core/tx-internal";
import { Address } from "./address";
import { safeChunkTransaction } from "./rlp";
import { EthSignature } from "ledger/ethsig";

export enum TransactionRequestErrors {
  InvalidTx = "Invalid tx type",
  InvalidDerivePath = "Invalid Derive Path",
}

export class TransactionRequest {
  constructor(
    public metadata: TransactionMetadata,
    public scilla?: ZILTransactionRequest,
    public evm?: TransactionRequestEVM,
  ) {}

  async #createEVMRawData(sig?: EthSignature) {
    if (!this.evm) {
      throw new Error(TransactionRequestErrors.InvalidTx);
    }

    const raw: any = {
      type: "eip1559" as const,
      to: await Address.fromStr(this.evm.to).toEthChecksum(),
      value: BigInt(this.evm.value ?? 0),
      data: this.evm.data ?? HEX_PREFIX,
      nonce: BigInt(this.evm.nonce ?? 0),
      gasLimit: BigInt(this.evm.gasLimit ?? 21000),
      maxFeePerGas: BigInt(this.evm.maxFeePerGas ?? 1_000_000_000n),
      maxPriorityFeePerGas: BigInt(this.evm.maxPriorityFeePerGas ?? 1_000_000_000n),
      chainId: this.evm.chainId ? BigInt(this.evm.chainId) : 1n,
      accessList: this.evm.accessList ?? [],
      r: undefined,
      s: undefined,
      v: undefined,
      yParity: undefined,
    };

    if (sig) {
      raw.r = BigInt(sig.r);
      raw.s = BigInt(sig.s);
      raw.v = sig.v;
      raw.yParity = sig.v - 27;
    }

    return raw;
  }

  async toRLP(pubKey: Uint8Array, derivationPath?: Uint8Array): Promise<Uint8Array[]> {
    if (this.scilla) {
      return [this.scilla.encode(pubKey)];
    }

    if (!derivationPath) {
      throw new Error(TransactionRequestErrors.InvalidDerivePath);
    }

    const rawTxData = await this.#createEVMRawData();
    const tx = new Transaction(rawTxData.type, rawTxData, false, false);
    return safeChunkTransaction(tx.toBytes(), derivationPath, rawTxData.type);
  }

  async withSignature(sig: string, pubKey: string) {
    const sigBytes = hexToUint8Array(sig);
    if (this.scilla) {
      const pubKeyBytes = hexToUint8Array(pubKey);
      const proto = this.scilla.toProto(pubKeyBytes);
      const zilTx = this.scilla.withSignature(sigBytes,proto, pubKeyBytes);

      return new SignedTransaction(this.metadata, zilTx, undefined);
    }

    const signature = EthSignature.fromHex(sig);
    const rawTxData = await this.#createEVMRawData(signature);
    const tx = new Transaction(rawTxData.type, rawTxData, false, false);

    return new SignedTransaction(this.metadata, undefined, tx.raw);
  }

  async sign(keypair: KeyPair) {
    if (this.scilla) {
      const receipt = await this.scilla.sign(keypair);
      return new SignedTransaction(this.metadata, receipt);
    }

    const rawTxData = await this.#createEVMRawData();
    const tx = new Transaction(rawTxData.type, rawTxData, false, false);
    const entropy = randomBytes(128);
    const receipt = tx.signBy(keypair.privateKey, entropy);

    return new SignedTransaction(this.metadata, undefined, receipt);
  }

  toJSON() {
    if (this.scilla) {
      return this.scilla.toJSON();
    }

    if (!this.evm) {
      throw new Error(TransactionRequestErrors.InvalidTx);
    }

    return {
      from: this.evm.from,
      to: this.evm.to,
      value: bigintToHex(this.evm.value ? BigInt(this.evm.value) : 0n),
      data: this.evm.data,
    };
  }
}

export class SignedTransaction {
  constructor(
    public metadata: TransactionMetadata,
    public scilla?: ZILTransactionReceipt,
    public evm?: Transaction<TxType>,
  ) {}

  async verify() {
    if (this.scilla) {
      return this.scilla.verify();
    }

    if (this.evm) {
      return this.evm.verifySignature();
    }

    throw new Error(TransactionRequestErrors.InvalidTx);
  }

  async toString() {
    if (this.scilla) {
      return JSON.stringify(await this.scilla.toJSON());
    }

    if (this.evm) {
      return this.evm.toHex();
    }

    throw new Error(TransactionRequestErrors.InvalidTx);
  }
}
