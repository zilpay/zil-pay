import type { TxType } from 'micro-eth-signer/esm/tx';
import { ZILTransactionRequest, ZILTransactionReceipt } from './zilliqa_tx';
import { Transaction } from 'micro-eth-signer';
import { KeyPair } from './keypair';
import { randomBytes } from './random';

export interface TransactionMetadata {
  chainHash: number;
  hash?: string;
  info?: string;
  icon?: string;
  title?: string;
  signer?: string; 
  tokenInfo?: [string, number, string]; 
}

export class TransactionRequest {
  constructor(
    public metadata: TransactionMetadata,
    public scilla?: ZILTransactionRequest,
    public evm?: Transaction<TxType>,
  ) {}

  async sign(keypair: KeyPair) {
    if (this.scilla) {
      const receipt = await this.scilla.sign(keypair);

      return new TransactionReceipt(
        this.metadata,
        receipt,
      );
    } else if (this.evm) {
      const entropy = randomBytes(128);
      const receipt = this.evm.signBy(keypair.privateKey, entropy);

      return new TransactionReceipt(
        this.metadata,
        undefined,
        receipt,
      );
    }

    throw new Error("Invlid tx type");
  }
}

export class TransactionReceipt {
  constructor(
    public metadata: TransactionMetadata,
    public scilla?: ZILTransactionReceipt,
    public evm?: Transaction<TxType>,
  ) {}
}
