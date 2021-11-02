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
import rateStore from 'popup/store/rate';
import ssnStore from 'popup/store/ssn';
import transactionsStore from 'popup/store/transactions';
import zrcStore from 'app/store/zrc';
import loadedStore from 'popup/store/loaded';

function updateState(state: WalletState) {
  console.log(state);
  
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
  zrcStore.set(state.zrc2);
  loadedStore.set(true);
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
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function restorePhrase(seed: string, password: string) {
  const data = await new Message({
    type: MTypePopup.SET_SEED_AND_PASSWORD,
    payload: {
      seed,
      password
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function createNextSeedAccount(name: string) {
  const data = await new Message({
    type: MTypePopup.CREATE_ACCOUNT_BY_SEED,
    payload: {
      name
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}
