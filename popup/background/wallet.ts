import type { BackgroundState } from "background/storage";

import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { Themes } from "config/theme";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import { themeDetect } from "popup/mixins/theme";
import globalStore from "popup/store/global";
 
export async function getGlobalState() {
  const data = await Message.signal(MTypePopup.GET_GLOBAL_STATE).send();
  let resolve = warpMessage(data) as BackgroundState;

  if (resolve.appearances == Themes.System) {
    resolve.appearances = themeDetect();
  }

  document.body.setAttribute("theme", resolve.appearances);
  globalStore.set(resolve);

  return resolve;
}

export async function generateBip39Words(count: number, wordList: string[]) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.GEN_BIP39,
    payload: {
      count,
      wordList
    },
  }).send();
  let resolve = warpMessage(data) as string;

  return resolve;
}


export async function setGlobalState() {
  const globalState = get(globalStore);

   await new Message({
    type: MTypePopup.SET_GLOBAL_STATE,
    payload: globalState,
  }).send();
}


