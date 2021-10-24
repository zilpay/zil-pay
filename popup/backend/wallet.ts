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
import guardStore, { GuardType } from 'popup/store/guard';

export class Wallet {
  public async getState() {
    const data = await Message.signal(
      MTypePopup.GET_WALLET_STATE
    ).send();
    const state = warpMessage(data);

    console.log(state);

    guardStore.set(state['guard'] as GuardType);

    return state;
  }
}

