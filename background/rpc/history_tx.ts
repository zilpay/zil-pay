import type { IFTokenState } from "background/storage";
import type { TransactionStatus } from "config/tx";
import type { TransactionMetadata, TransactionReceiptEVM, TransactionReceiptScilla } from "types/tx";


export interface IHistoricalTransactionState {
  status: TransactionStatus;
  metadata: TransactionMetadata;
  token: IFTokenState;
  evm?: TransactionReceiptEVM;
  scilla?: TransactionReceiptScilla;
}

export class HistoricalTransaction implements IHistoricalTransactionState {
  status: TransactionStatus;
  metadata: TransactionMetadata;
  evm?: TransactionReceiptEVM;
  scilla?: TransactionReceiptScilla;
  token: IFTokenState;

  constructor(data: IHistoricalTransactionState) {
    this.status = data.status;
    this.token = data.token;
    this.metadata = data.metadata;
    this.evm = data.evm;
    this.scilla = data.scilla;
  }

  toJSON(): IHistoricalTransactionState {
    return {
      status: this.status,
      metadata: this.metadata,
      token: this.token,
      evm: this.evm,
      scilla: this.scilla,
    };
  }
}

