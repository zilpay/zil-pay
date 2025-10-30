import type { ConnectParams } from "types/connect";
import type { TransactionRequestScilla, TransactionMetadata, TransactionRequestEVM, SignMesageReqScilla, SignPersonalMessageEVM, SignTypedDataEVM } from "types/tx";

export interface IConfirmState {
  uuid: string;
  metadata?: TransactionMetadata;
  scilla?: TransactionRequestScilla;
  signMessageScilla?: SignMesageReqScilla;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: SignPersonalMessageEVM;
  signTypedDataJsonEVM?: SignTypedDataEVM;
  connect?: ConnectParams;
}

export class ConfirmState implements IConfirmState {
  uuid: string;
  metadata?: TransactionMetadata;
  scilla?: TransactionRequestScilla;
  signMessageScilla?: SignMesageReqScilla;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: SignPersonalMessageEVM;
  signTypedDataJsonEVM?: SignTypedDataEVM;
  connect?: ConnectParams;

  constructor(data: IConfirmState) {
    this.uuid = data.uuid;

    if (data.metadata) {
      this.metadata = data.metadata;
    }

    if (data.scilla) {
      this.scilla = data.scilla;
    }

    if (data.evm) {
      this.evm = data.evm;
    }

    if (data.signPersonalMessageEVM) {
      this.signPersonalMessageEVM = data.signPersonalMessageEVM;
    }

    if (data.signMessageScilla) {
      this.signMessageScilla = data.signMessageScilla;
    }

    if (data.signPersonalMessageEVM) {
      this.signPersonalMessageEVM = data.signPersonalMessageEVM;
    }

    if (data.signTypedDataJsonEVM) {
      this.signTypedDataJsonEVM = data.signTypedDataJsonEVM;
    }

    if (data.connect) {
      this.connect = data.connect;
    }
  }

  toJSON(): IConfirmState {
    return {
      uuid: this.uuid,
      metadata: this.metadata,
      scilla: this.scilla,
      signMessageScilla: this.signMessageScilla,
      evm: this.evm,
      signPersonalMessageEVM: this.signPersonalMessageEVM,
      signTypedDataJsonEVM: this.signTypedDataJsonEVM,
      connect: this.connect,
    };
  }
}
