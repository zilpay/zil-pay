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
import guardStore from 'popup/store/guard';

export class Wallet {
  public async getState() {
    const data = await Message.signal(
      MTypePopup.GET_WALLET_STATE
    ).send();

    if (data.reject) {
      throw new Error(String(data.reject));
    }

    guardStore.set(data.resolve['guard']);

    return data.resolve;
  }
}

