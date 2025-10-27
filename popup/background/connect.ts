import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
import type { IConfirmState } from "background/storage/confirm";
 

export async function rejectConnect(uuid: string, walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.DISCONNECT_APP,
    payload: { uuid, walletIndex },
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
