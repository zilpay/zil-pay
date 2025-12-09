import type { IConfirmState } from "background/storage/confirm";
import { warpMessage } from "lib/popup/warp-message";
import { LegacyZilliqaTabMsg, type SendResponseParams } from "lib/streem";
import { Message } from "lib/streem/message";
import { get } from "svelte/store";
import globalStore from "popup/store/global";
import { MTypePopup } from "config/stream";


export async function responseToSignMessageScilla(
  uuid: string,
  walletIndex: number,
  accountIndex: number,
  approve: boolean,
  signature?: string,
) {
  const data = await new Message<SendResponseParams>({
    type: LegacyZilliqaTabMsg.SING_MESSAGE_RES,
    payload: { uuid, walletIndex, approve, accountIndex, signature, },
  }).send();
  
  const resolve = warpMessage(data) as IConfirmState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    wallets: currentState.wallets.map((wallet, index) => 
      index === walletIndex 
        ? { ...wallet, confirm: resolve }
        : wallet
    )
  });

  return resolve;
}

export async function responseToEthSign(
  uuid: string,
  walletIndex: number,
  accountIndex: number,
  approve: boolean,
  signature?: string,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.EVM_RESPONSE_ETH_SIGN,
    payload: { uuid, walletIndex, approve, accountIndex, signature, },
  }).send();

  const resolve = warpMessage(data) as IConfirmState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    wallets: currentState.wallets.map((wallet, index) =>
      index === walletIndex
        ? { ...wallet, confirm: resolve }
        : wallet
    )
  });

  return resolve;
}

export async function responseToSignPersonalMessageEVM(
  uuid: string,
  walletIndex: number,
  accountIndex: number,
  approve: boolean,
  signature?: string,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.EVM_RESPONSE_PERSONAL_MESSAGE,
    payload: { uuid, walletIndex, approve, accountIndex, signature, },
  }).send();

  const resolve = warpMessage(data) as IConfirmState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    wallets: currentState.wallets.map((wallet, index) =>
      index === walletIndex
        ? { ...wallet, confirm: resolve }
        : wallet
    )
  });

  return resolve;
}
export async function responseToSignTypedDataEVM(
  uuid: string,
  walletIndex: number,
  accountIndex: number,
  approve: boolean,
  signature?: string,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.EVM_RESPONSE_TYPED_MESSAGE,
    payload: { uuid, walletIndex, approve, accountIndex, signature, },
  }).send();
  
  const resolve = warpMessage(data) as IConfirmState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    wallets: currentState.wallets.map((wallet, index) => 
      index === walletIndex 
        ? { ...wallet, confirm: resolve }
        : wallet
    )
  });

  return resolve;
}
