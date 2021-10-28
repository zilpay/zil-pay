/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { WalletState } from 'types/account';
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import guardStore from 'popup/store/guard';
import walletStore from 'popup/store/wallet';
import netStore from 'popup/store/netwrok';
import themeStore from 'popup/store/theme';
import appStore from 'popup/store/apps';
import contactsStore from 'popup/store/contacts';
import currencyStore from 'popup/store/currency';
import gasStore from 'popup/store/gas';
import rateStore from 'app/store/rate';
import ssnStore from 'app/store/ssn';
import transactionsStore from 'app/store/transactions';
import zrc2Store from 'app/store/zrc2';

function updateState(state: WalletState) {
  guardStore.set(state.guard);
  walletStore.set(state.wallet);
  netStore.set(state.netwrok);
  themeStore.set(state.theme);
  appStore.set(state.apps);
  contactsStore.set(state.contacts);
  currencyStore.set(state.currency);
  gasStore.set(state.gas);
  rateStore.set(state.rate);
  ssnStore.set(state.ssn);
  transactionsStore.set(state.transactions);
  zrc2Store.set(state.zrc2);
}

export async function getState() {
  const data = await Message.signal(
    MTypePopup.GET_WALLET_STATE
  ).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function unlockWallet(password: string) {
  const data = await new Message({
    type: MTypePopup.SET_PASSWORD,
    payload: {
      password
    }
  }).send();
  console.log(data);
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}