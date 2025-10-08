import type { MinScillaParams, TransactionMetadata, TransactionRequestEVM } from "types/tx";

export interface IConfirmState {
  uuid: string;
  metadata?: TransactionMetadata;
  scilla?: MinScillaParams;
  signMessageScilla?: string;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: string;
  signTypedDataJsonEVM?: string;
}

export class ConfirmState implements IConfirmState {
  uuid: string;
  metadata?: TransactionMetadata;
  scilla?: MinScillaParams;
  signMessageScilla?: string;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: string;
  signTypedDataJsonEVM?: string;

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

    if (data.signPersonalMessageEVM) {
      this.signPersonalMessageEVM = data.signPersonalMessageEVM;
    }

    if (data.signTypedDataJsonEVM) {
      this.signTypedDataJsonEVM = data.signTypedDataJsonEVM;
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
      signTypedDataJsonEVM: this.signTypedDataJsonEVM
    };
  }
}
