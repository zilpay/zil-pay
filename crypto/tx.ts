import { ZILTransactionRequest, ZILTransactionReceipt } from "./zilliqa_tx";
import { Transaction } from "micro-eth-signer";
import { KeyPair } from "./keypair";
import { randomBytes } from "./random";
import { bigintToHex, HEX_PREFIX } from "lib/utils/hex";
import type { TransactionMetadata, TransactionRequestEVM } from "types/tx";
import type { TxType } from "micro-eth-signer/core/tx-internal";
import { Address } from "./address";

export enum TransactionRequestErrors {
  InvalidTx = "Invalid tx type",
}

export class TransactionRequest {
  constructor(
    public metadata: TransactionMetadata,
    public scilla?: ZILTransactionRequest,
    public evm?: TransactionRequestEVM,
  ) {}

  async toRLP(pubKey: Uint8Array): Promise<Uint8Array> {
    if (this.scilla) {
      return this.scilla.encode(pubKey);
    } else if (this.evm) {
      const txType = "eip1559";
      const rawTxData = {
        type: txType,
        to: await Address.fromStr(this.evm.to).toEthChecksum(),
        value: BigInt(this.evm.value ?? 0),
        data: this.evm.data ?? HEX_PREFIX,
        nonce: BigInt(this.evm.nonce ?? 0),
        gasLimit: BigInt(this.evm.gasLimit ?? 21000),
        maxFeePerGas: BigInt(this.evm.maxFeePerGas ?? 1_000_000_000n),
        maxPriorityFeePerGas: BigInt(
          this.evm.maxPriorityFeePerGas ?? 1_000_000_000n,
        ),
        chainId: this.evm.chainId ? BigInt(this.evm.chainId) : 1n,
        accessList: this.evm.accessList ?? [],
      };

      const tx = new Transaction(txType, rawTxData, false, false);
      return tx.toBytes();
    }

    throw new Error(TransactionRequestErrors.InvalidTx);
  }

  async sign(keypair: KeyPair) {
    if (this.scilla) {
      const receipt = await this.scilla.sign(keypair);
      return new SignedTransaction(this.metadata, receipt);
    } else if (this.evm) {
      const txType = "eip1559";
      const rawTxData = {
        type: txType,
        to: await Address.fromStr(this.evm.to).toEthChecksum(),
        value: BigInt(this.evm.value ?? 0),
        data: this.evm.data ?? HEX_PREFIX,
        nonce: BigInt(this.evm.nonce ?? 0),
        gasLimit: BigInt(this.evm.gasLimit ?? 21000),
        maxFeePerGas: BigInt(this.evm.maxFeePerGas ?? 1_000_000_000n),
        maxPriorityFeePerGas: BigInt(
          this.evm.maxPriorityFeePerGas ?? 1_000_000_000n,
        ),
        chainId: this.evm.chainId ? BigInt(this.evm.chainId) : 1n,
        accessList: this.evm.accessList ?? [],
      };

      const tx = new Transaction(txType, rawTxData, false, false);
      const entropy = randomBytes(128);
      const receipt = tx.signBy(keypair.privateKey, entropy);

      return new SignedTransaction(this.metadata, undefined, receipt);
    }

    throw new Error(TransactionRequestErrors.InvalidTx);
  }

  toJSON() {
    if (this.scilla) {
      return this.scilla.toJSON();
    } else if (this.evm) {
      return {
        from: this.evm.from,
        to: this.evm.to,
        value: bigintToHex(this.evm.value ? BigInt(this.evm.value) : 0n),
        data: this.evm.data,
      };
    }

    throw new Error(TransactionRequestErrors.InvalidTx);
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
    } else if (this.evm) {
      return this.evm.verifySignature();
    }

    throw new Error(TransactionRequestErrors.InvalidTx);
  }

  async toString() {
    if (this.scilla) {
      return JSON.stringify(await this.scilla.toJSON());
    } else if (this.evm) {
      return this.evm.toHex();
    }

    throw new Error(TransactionRequestErrors.InvalidTx);
  }
}
