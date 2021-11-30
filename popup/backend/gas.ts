/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';

export async function changeGasMultiplier(multiplier: number) {
  const data = await new Message({
    type: MTypePopup.SET_GAS_MULTIPLIER,
    payload: {
      multiplier
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function resetGas() {
  const data = await Message
    .signal(MTypePopup.RESET_GAS)
    .send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}
