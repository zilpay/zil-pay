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

export async function rejectSignMessage() {
  const data = await Message
    .signal(MTypePopup.REJECT_SIGN_MESSAGE)
    .send();
  warpMessage(data);
}

export async function signMessageApprove(index: number) {
  const data = await new Message({
    type: MTypePopup.SIGN_MESSAGE_APPROVE,
    payload: {
      index
    }
  }).send();
  warpMessage(data);
}
