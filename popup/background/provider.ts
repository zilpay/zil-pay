import type { BackgroundState, IFTokenState } from "background/storage";

import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
 

export async function ftBalanceUpdate(walletIndex: number) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.WALLET_BALANCE_UPDATE,
    payload: {
      walletIndex,
    },
  }).send();
  let resolve = warpMessage(data) as IFTokenState[];
  const currentState = get(globalStore);

  currentState.wallets[walletIndex].tokens = resolve;

  globalStore.set({
    ...currentState,
  });

  return resolve;
}
