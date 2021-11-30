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

export async function userResponseConnection(confirmed: boolean) {
  const data = await new Message({
    type: MTypePopup.USER_RESPONSE_DAPP,
    payload: {
      confirmed
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function removeConnection(index: number) {
  const data = await new Message({
    type: MTypePopup.RM_APP,
    payload: {
      index
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function clearConnection() {
  const data = await Message.signal(
    MTypePopup.CLEAR_APPS
  ).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function logoutWallet() {
  const data = await Message.signal(
    MTypePopup.LOG_OUT
  ).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}
