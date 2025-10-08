import type { MinScillaParams, TransactionMetadata, TransactionRequestEVM } from "types/tx";

export interface IConfirmState {
  uuid: string;
  title: string;
  icon: string;
  metadata?: TransactionMetadata;
  scilla?: MinScillaParams;
  signMessageScilla?: string;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: string;
  signTypedDataJsonEVM?: string;
}

export class ConfirmState implements IConfirmState {
  uuid: string;
  title: string;
  icon: string;
  metadata?: TransactionMetadata;
  scilla?: MinScillaParams;
  signMessageScilla?: string;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: string;
  signTypedDataJsonEVM?: string;

  constructor(data: IConfirmState) {
    this.uuid = data.uuid;
    this.title = data.title;
    this.icon = data.icon;

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
      title: this.title,
      icon: this.icon,
      metadata: this.metadata,
      scilla: this.scilla,
      signMessageScilla: this.signMessageScilla,
      evm: this.evm,
      signPersonalMessageEVM: this.signPersonalMessageEVM,
      signTypedDataJsonEVM: this.signTypedDataJsonEVM
    };
  }
}
