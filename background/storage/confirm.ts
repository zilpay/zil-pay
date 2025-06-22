import type { MinScillaParams, TokenTransferMetadata, TransactionRequestEVM } from "types/tx";

export class ConfirmState {
  uuid: string;
  title: string;
  icon: string;
  token?: TokenTransferMetadata;
  scilla?: MinScillaParams;
  signMessageScilla?: string;
  evm?: TransactionRequestEVM;
  signPersonalMessageEVM?: string;
  signTypedDataJsonEVM?: string;

  constructor(data: Record<string, unknown>) {
    this.uuid = data.uuid as string;
    this.title = data.title as string;
    this.icon = data.icon as string;

    if (data.token) {
      this.token = data.token as TokenTransferMetadata;
    }

    if (data.scilla) {
      this.scilla = data.scilla as MinScillaParams;
    }

    if (data.evm) {
      this.evm = data.evm as TransactionRequestEVM;
    }

    if (data.signPersonalMessageEVM) {
      this.signPersonalMessageEVM = data.signPersonalMessageEVM as string;
    }

    if (data.signPersonalMessageEVM) {
      this.signPersonalMessageEVM = data.signPersonalMessageEVM as string;
    }

    if (data.signTypedDataJsonEVM) {
      this.signTypedDataJsonEVM = data.signTypedDataJsonEVM as string;
    }
  }
}
