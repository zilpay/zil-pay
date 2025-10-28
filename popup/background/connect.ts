import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
import type { IConfirmState } from "background/storage/confirm";
 

export async function responseToConnect(uuid: string, walletIndex: number, approve: boolean) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.RESPONSE_TO_DAPP,
    payload: { uuid, walletIndex, approve },
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

