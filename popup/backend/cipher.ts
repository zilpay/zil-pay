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

export async function responseEncryption(value: boolean, index = 0) {
  const data = await new Message({
    type: MTypePopup.RES_ENCRYPTION,
    payload: {
      value,
      index
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function responseDecryption(value: boolean, index = 0) {
  const data = await new Message({
    type: MTypePopup.RES_DECRYPTION,
    payload: {
      value,
      index
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}
