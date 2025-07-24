import type { MinScillaParams, TokenTransferMetadata, TransactionRequestEVM } from "types/tx";

export interface IConfirmState {
  uuid: string;
  title: string;
  icon: string;
  token?: TokenTransferMetadata;
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
  token?: TokenTransferMetadata;
  scilla?: MinScillaParams;
  signMessageScilla?: string;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: string;
  signTypedDataJsonEVM?: string;

  constructor(data: IConfirmState) {
    this.uuid = data.uuid;
    this.title = data.title;
    this.icon = data.icon;

    if (data.token) {
      this.token = data.token;
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
}
