import type { TxType } from 'micro-eth-signer/esm/tx';
import { ZILTransactionRequest, ZILTransactionReceipt } from './zilliqa_tx';
import { Transaction } from 'micro-eth-signer';

export enum TransactionType {
  Scilla,
  EVM
}

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
    public type: TransactionType,
    public metadata: TransactionMetadata,
    public data: ZILTransactionRequest | Transaction<TxType>,
  ) {}
}

export class TransactionReceipt {
  constructor(
    public type: TransactionType,
    public metadata: TransactionMetadata,
    public data: ZILTransactionReceipt | Transaction<TxType>,
  ) {}
}

