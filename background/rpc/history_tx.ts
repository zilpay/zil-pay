import type { TransactionStatus } from "config/tx";
import type { TransactionMetadata, TransactionReceiptEVM, TransactionReceiptScilla } from "types/tx";


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

  toJSON(): IHistoricalTransactionState {
    return {
      status: this.status,
      metadata: this.metadata,
      evm: this.evm,
      scilla: this.scilla,
    };
  }
}

