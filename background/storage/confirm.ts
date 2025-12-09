import type { EvmAddChainRequest } from "types/chain";
import type { ConnectParams } from "types/connect";
import type { TransactionRequestScilla, TransactionMetadata, TransactionRequestEVM, SignMesageReqScilla, SignMessageEVM, SignPersonalMessageEVM, SignTypedDataEVM } from "types/tx";
import { FToken, type IFTokenState } from "./ftoken";

export interface IConfirmState {
  uuid: string;
  metadata?: TransactionMetadata;
  scilla?: TransactionRequestScilla;
  signMessageScilla?: SignMesageReqScilla;
  evm?: TransactionRequestEVM;
  signMessageEVM?: SignMessageEVM;
  signPersonalMessageEVM?: SignPersonalMessageEVM;
  signTypedDataJsonEVM?: SignTypedDataEVM;
  evmAddChainRequest?: EvmAddChainRequest;
  evmAddAssetRequest?: IFTokenState[];
  connect?: ConnectParams;
}

export class ConfirmState implements IConfirmState {
  uuid: string;
  metadata?: TransactionMetadata;
  scilla?: TransactionRequestScilla;
  signMessageScilla?: SignMesageReqScilla;
  evm?: TransactionRequestEVM;
  signMessageEVM?: SignMessageEVM;
  signPersonalMessageEVM?: SignPersonalMessageEVM;
  signTypedDataJsonEVM?: SignTypedDataEVM;
  evmAddChainRequest?: EvmAddChainRequest;
  evmAddAssetRequest?: FToken[];
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

    if (data.signMessageEVM) {
      this.signMessageEVM = data.signMessageEVM;
    }

    if (data.signPersonalMessageEVM) {
      this.signPersonalMessageEVM = data.signPersonalMessageEVM;
    }

    if (data.signTypedDataJsonEVM) {
      this.signTypedDataJsonEVM = data.signTypedDataJsonEVM;
    }

    if (data.evmAddChainRequest) {
      this.evmAddChainRequest = data.evmAddChainRequest;
    }

    if (data.evmAddAssetRequest && data.evmAddAssetRequest.length > 0) {
      this.evmAddAssetRequest = data.evmAddAssetRequest.map((t) => new FToken(t));
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
      signMessageEVM: this.signMessageEVM,
      signPersonalMessageEVM: this.signPersonalMessageEVM,
      signTypedDataJsonEVM: this.signTypedDataJsonEVM,
      evmAddChainRequest: this.evmAddChainRequest,
      evmAddAssetRequest: this.evmAddAssetRequest,
      connect: this.connect,
    };
  }
}
