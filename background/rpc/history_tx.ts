import type { TransactionStatus } from "config/tx";
import type { TransactionMetadata, TransactionReceiptEVM, TransactionReceiptScilla } from "types/tx";


export interface IHistoricalTransactionState {
  status: TransactionStatus;
  metadata: TransactionMetadata;
  evm?: TransactionReceiptEVM;
  scilla?: TransactionReceiptScilla;
  timestamp: number;
}

export class HistoricalTransaction implements IHistoricalTransactionState {
  status: TransactionStatus;
  metadata: TransactionMetadata;
  evm?: TransactionReceiptEVM;
  scilla?: TransactionReceiptScilla;
  timestamp: number;

  constructor(data: IHistoricalTransactionState) {
    this.status = data.status;
    this.metadata = data.metadata;
    this.evm = data.evm;
    this.scilla = data.scilla;
    this.timestamp = data.timestamp;
  }

  toJSON(): IHistoricalTransactionState {
    return {
      status: this.status,
      metadata: this.metadata,
      evm: this.evm,
      scilla: this.scilla,
      timestamp: this.timestamp,
    };
  }
}

