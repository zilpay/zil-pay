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

export async function addLedgerAccount(index: number, productId: number, name: string) {
  const ledger = new LedgerWebHID();
  await ledger.init(productId);
  const { publicKey, pubAddr } = await ledger.interface.getPublicAddress(index);

  const data = await new Message({
    type: MTypePopup.ADD_LEDGER_ACCOUNT,
    payload: {
      index,
      name,
      productId,
      pubAddr,
      publicKey,
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}
