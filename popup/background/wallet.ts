import type { BackgroundState } from "background/storage";

import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { Themes } from "config/theme";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import { themeDetect } from "popup/mixins/theme";
import globalStore from "popup/store/global";
import type { IKeyPair } from "types/wallet";
 
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

export async function generateKeyPair(slip44: number) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.GEN_KEYPAIR,
    payload: {
      slip44,
    },
  }).send();
  let resolve = warpMessage(data) as IKeyPair;
  return resolve;
}

export async function fromRpivKey(slip44: number, key: string) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.FROM_PRIV_KEY,
    payload: {
      slip44,
      key,
    },
  }).send();
  let resolve = warpMessage(data) as IKeyPair;
  return resolve;
}

export async function validateBip39Checksum(phrase: string, wordList: string[]) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.VALIDATE_BIP39_CHECK_SUM,
    payload: {
      phrase,
      wordList,
    },
  }).send();
  let resolve = warpMessage(data) as boolean;
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


