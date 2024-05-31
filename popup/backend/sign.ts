/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { MinParams, TransactionForConfirm } from "types/transaction";
import type { MessagePayload } from 'types/transaction';

import { Message } from "lib/streem/message";
import { MTypePopup, MTypeTab } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';
import { get } from 'svelte/store';
import walletStore from 'popup/store/wallet';
import { AccountTypes } from "config/account-type";
import { LedgerWebHID } from "lib/ledger";
import { TypeOf } from "lib/type/type-checker";

export async function rejectSignMessage() {
  const data = await Message
    .signal(MTypePopup.REJECT_SIGN_MESSAGE)
    .send();
  warpMessage(data);
}

export async function signMessageApprove(index: number, message: MessagePayload) {
  const wallet = get(walletStore);
  const account = wallet.identities[index];
  let sig = '';

  if (account.type === AccountTypes.Ledger) {
    const ledger = new LedgerWebHID();
    await ledger.init(account.productId);
    sig = await ledger.interface.signHash(account.index, message);
  }

  const data = await new Message({
    type: MTypePopup.SIGN_MESSAGE_APPROVE,
    payload: {
      index,
      sig
    }
  }).send();
  warpMessage(data);
}

export async function sendToSignTx(params: MinParams) {
  const data = await new Message({
    type: MTypeTab.CALL_TO_SIGN_TX,
    payload: params
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function rejectForSignTx(index: number) {
  const data = await new Message({
    type: MTypePopup.REJECT_CONFIRM_TX,
    payload: {
      index
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function getTxRequiredParams(index: number) {
  const data = await new Message({
    type: MTypePopup.GET_REQUIRED_PARAMS,
    payload: {
      index
    }
  }).send();
  return warpMessage(data);
}

export async function sendTransactionToSign(txIndex: number, index: number, params: TransactionForConfirm): Promise<string> {
  const data = await new Message({
    type: MTypePopup.SEND_TO_SIGN_TX,
    payload: {
      index,
      txIndex,
      params
    }
  }).send();
  const state = warpMessage(data);

  if (TypeOf.isString(state)) {
    return state;
  } else {
    updateState(state);
    return '';
  }
}
