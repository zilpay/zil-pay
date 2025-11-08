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
import { ZERO_EVM } from "config/common";

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

  #getTxType(): TxType {
    if (!this.evm) {
      throw new Error(TransactionRequestErrors.InvalidTx);
    }
    if (this.evm.authorizationList) {
      return "eip7702";
    }
    if (this.evm.maxFeePerBlobGas || this.evm.blobVersionedHashes) {
      return "eip4844";
    }
    if (this.evm.maxFeePerGas || this.evm.maxPriorityFeePerGas) {
      return "eip1559";
    }
    if (this.evm.accessList) {
      return "eip2930";
    }
    return "legacy";
  }

  async #createEVMRawData(type: TxType, sig?: EthSignature): Promise<any> {
    if (!this.evm) {
      throw new Error(TransactionRequestErrors.InvalidTx);
    }

    const raw: any = {
      type,
      value: BigInt(this.evm.value ?? 0),
      data: this.evm.data ?? HEX_PREFIX,
      nonce: BigInt(this.evm.nonce ?? 0),
      gasLimit: BigInt(this.evm.gasLimit ?? 21000),
      chainId: this.evm.chainId ? BigInt(this.evm.chainId) : 1n,
    };

    if (this.evm.to) {
      raw.to = await Address.fromStr(this.evm.to).toEthChecksum();
    } else {
      raw.to = ZERO_EVM;
    }

    switch (type) {
      case "legacy":
        raw.gasPrice = BigInt(this.evm.gasPrice ?? 1_000_000_000n);
        break;
      case "eip2930":
        raw.gasPrice = BigInt(this.evm.gasPrice ?? 1_000_000_000n);
        raw.accessList = this.evm.accessList ?? [];
        break;
      case "eip1559":
        raw.maxFeePerGas = BigInt(this.evm.maxFeePerGas ?? 1_000_000_000n);
        raw.maxPriorityFeePerGas = BigInt(
          this.evm.maxPriorityFeePerGas ?? 1_000_000_000n,
        );
        raw.accessList = this.evm.accessList ?? [];
        break;
      case "eip4844":
        raw.maxFeePerGas = BigInt(this.evm.maxFeePerGas ?? 1_000_000_000n);
        raw.maxPriorityFeePerGas = BigInt(
          this.evm.maxPriorityFeePerGas ?? 1_000_000_000n,
        );
        raw.accessList = this.evm.accessList ?? [];
        raw.maxFeePerBlobGas = BigInt(
          this.evm.maxFeePerBlobGas ?? 1_000_000_000n,
        );
        raw.blobVersionedHashes = this.evm.blobVersionedHashes ?? [];
        break;
      case "eip7702":
        raw.maxFeePerGas = BigInt(this.evm.maxFeePerGas ?? 1_000_000_000n);
        raw.maxPriorityFeePerGas = BigInt(
          this.evm.maxPriorityFeePerGas ?? 1_000_000_000n,
        );
        raw.accessList = this.evm.accessList ?? [];
        raw.authorizationList = (this.evm as any).authorizationList ?? [];
        break;
    }

    if (sig) {
      raw.r = BigInt(`${HEX_PREFIX}${sig.r}`);
      raw.s = BigInt(`${HEX_PREFIX}${sig.s}`);
      raw.yParity = sig.v;
    }

    return raw;
  }

  async toRLP(
    pubKey: Uint8Array,
    derivationPath?: Uint8Array,
  ): Promise<Uint8Array[]> {
    if (this.scilla) {
      return [this.scilla.encode(pubKey)];
    }

    if (!derivationPath) {
      throw new Error(TransactionRequestErrors.InvalidDerivePath);
    }

    const type = this.#getTxType();
    const rawTxData = await this.#createEVMRawData(type);
    const tx = new Transaction(type, rawTxData, false);
    return safeChunkTransaction(tx.toBytes(), derivationPath, type);
  }

  async withSignature(sig: string, pubKey: string) {
    if (this.scilla) {
      const sigBytes = hexToUint8Array(sig);
      const pubKeyBytes = hexToUint8Array(pubKey);
      const proto = this.scilla.toProto(pubKeyBytes);
      const zilTx = this.scilla.withSignature(sigBytes, proto, pubKeyBytes);
      return new SignedTransaction(this.metadata, zilTx, undefined);
    }

    const signature = EthSignature.fromHex(sig);
    const type = this.#getTxType();
    const rawTxData = await this.#createEVMRawData(type, signature);
    const tx = new Transaction(type, rawTxData, false);

    return new SignedTransaction(this.metadata, undefined, tx);
  }

  async sign(keypair: KeyPair) {
    if (this.scilla) {
      const receipt = await this.scilla.sign(keypair);
      return new SignedTransaction(this.metadata, receipt);
    }

    const type = this.#getTxType();
    const rawTxData = await this.#createEVMRawData(type);
    const tx = new Transaction(type, rawTxData, false);
    const entropy = randomBytes(128);
    const signedTx = tx.signBy(keypair.privateKey, entropy);

    return new SignedTransaction(this.metadata, undefined, signedTx);
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
