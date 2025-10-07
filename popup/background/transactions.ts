import type { BackgroundState } from "background/storage";
import type { BuildTokenTransferParams } from "types/tx";

import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";

export async function buildTokenTransfer(params: BuildTokenTransferParams) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.BUILD_TOKEN_TRANSFER,
    payload: params,
  }).send();
  
  const resolve = warpMessage(data) as BackgroundState;
  globalStore.set(resolve);
  return resolve;
}




