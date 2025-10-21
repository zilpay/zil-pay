import type { BackgroundState, IFTokenState } from "background/storage";

import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
 

export async function ftUpdateRates(walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.FT_UPDATE_RATES,
    payload: { walletIndex },
  }).send();
  
  const resolve = warpMessage(data) as IFTokenState[];

  console.log(resolve);

  return resolve;
}

