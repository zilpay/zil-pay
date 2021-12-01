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

export async function checkProcessedTx() {
  const data = await Message
    .signal(MTypePopup.UPDATE_TXNS)
    .send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function clearAllTxns() {
  const data = await Message
    .signal(MTypePopup.CLEAR_ALL_TXNS)
    .send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function getCurrentNonce() {
  const data = await Message
  .signal(MTypePopup.GET_CURRENT_NONCE)
  .send();
  return warpMessage(data);
}

export async function resetNonce() {
  const data = await Message
    .signal(MTypePopup.RESET_NONCE)
    .send();
  return warpMessage(data);
}
