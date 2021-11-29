/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Info } from "types/token";
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';

export async function getZRC2State(address: string) {
  const data = await new Message({
    type: MTypePopup.GET_ZRC2_STATE,
    payload: {
      address
    }
  }).send();
  const state = warpMessage(data);
  return state;
}

export async function addZRC2Token(token: ZRC2Info) {
  const data = await new Message({
    type: MTypePopup.ADD_ZRC2_TOKEN,
    payload: token
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function removeZRC2Token(index: number) {
  const data = await new Message({
    type: MTypePopup.RM_TOKEN,
    payload: {
      index
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}
