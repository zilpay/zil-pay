/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { LedgerWebHID } from "lib/ledger";
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';

export async function loadLedgerAccount(index: number, productId: number, name: string) {
  try {
    const ledger = new LedgerWebHID();
    await ledger.init(productId);
    console.log(ledger);
    const { publicKey, pubAddr } = await ledger.interface.getPublicAddress(index);
    console.log(publicKey, pubAddr);
  } catch (err) {
    alert(err);
  }


  // const data = await new Message({
  //   type: MTypePopup.LEDGER_LOAD_ACCOUNT,
  //   payload: {
  //     index,
  //     name,
  //     productId,
  //     pubAddr,
  //     publicKey,
  //   }
  // }).send();
  // const state = warpMessage(data);
  // updateState(state);
  // return state;
}
