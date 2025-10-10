import { ZILLIQA } from "config/slip44";
import { TransactionStatus } from "config/tx";
import { Address } from "crypto/address";
import type { TransactionReceipt } from "crypto/tx";
import { uint8ArrayToHex } from "lib/utils/hex";
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

  static async fromTransactionReceipt(receipt: TransactionReceipt, hash: string): Promise<HistoricalTransaction> {
    const commonData = {
      status: TransactionStatus.Pending,
      metadata: receipt.metadata,
      timestamp: Math.floor(Date.now() / 1000),
    };

    if (receipt.scilla) {
      const scillaData = await receipt.scilla.toJSON();
      const senderAddr = await Address.fromPubKey(receipt.scilla.pubKey, ZILLIQA);

      const historicalScilla: TransactionReceiptScilla = {
        ...scillaData,
         version: String(scillaData.version),
        nonce: String(scillaData.nonce),
        senderPubKey: uint8ArrayToHex(receipt.scilla.pubKey),
        hash: hash,
        senderAddr: await senderAddr.toZilBech32(),
      };
      
      return new HistoricalTransaction({
        ...commonData,
        scilla: historicalScilla,
      });

    } else if (receipt.evm) {
      const sender = receipt.evm.recoverSender();
      const rawTx = receipt.evm.raw;

      const historicalEvm: TransactionReceiptEVM = {
        transactionHash: hash,
        from: sender.address,
        to: rawTx.to || '',

        type: String(receipt.evm.type),
      };

      return new HistoricalTransaction({
        ...commonData,
        evm: historicalEvm,
      });

    } else {
      throw new Error("Invalid TransactionReceipt");
    }
  }
}

