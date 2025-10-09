import type { TransactionMetadata, TransactionReceiptEVM, TransactionReceiptScilla } from "types/tx";

export enum TransactionStatus {
  Pending,
  Success,
  Failed,
}


export interface IHistoricalTransactionState {
  status: TransactionStatus;
  metadata: TransactionMetadata;
  evm?: TransactionReceiptEVM;
  scilla?: TransactionReceiptScilla;
}

export class HistoricalTransaction implements IHistoricalTransactionState {
  status: TransactionStatus;
  metadata: TransactionMetadata;
  evm?: TransactionReceiptEVM;
  scilla?: TransactionReceiptScilla;

  constructor(data: IHistoricalTransactionState) {
    this.status = data.status;
    this.metadata = data.metadata;
    this.evm = data.evm;
    this.scilla = data.scilla;
  }
}

